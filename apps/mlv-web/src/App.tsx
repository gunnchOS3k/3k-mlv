import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import {
  isSupabaseConfigured,
  parseMlvDeepLink,
  supabase,
  useAuth,
  useMlvWorkspace,
  type MlvNode,
  type MlvWorldPlacement,
  type Project,
} from '@3k-mlv/shared';
import Phone from './ui/Phone';
import ListWorkspace from './ui/ListWorkspace';
import FileViewer from './ui/FileViewer';
import { createBrowserWorkspace } from './workspace/browserStore';
import { describeOffline } from './workspace/offline';
import './campus/campus.css';
import { portalReturnHref } from './portalReturn.mjs';
import { sceneById } from './world/worldDefs';
import type { WorldEntry, WorldSceneId } from './world/types';

const CampusLanding = lazy(() => import('./campus/CampusLanding'));
const Atlas = lazy(() => import('./campus/Atlas'));
const DigitalCampus = lazy(() => import('./campus/DigitalCampus'));
const Library = lazy(() => import('./campus/Library'));
const StudyRooms = lazy(() => import('./campus/StudyRooms'));
const LectureHall = lazy(() => import('./campus/LectureHall'));
const MediaCenter = lazy(() => import('./campus/MediaCenter'));
const GallerySite = lazy(() => import('./campus/GallerySite'));
const WaikeCenter = lazy(() => import('./campus/WaikeCenter'));
const NetworkTwinLab = lazy(() => import('./campus/NetworkTwinLab'));
const ResearchSurface = lazy(() => import('./campus/ResearchSurface'));
const WorldRuntime = lazy(() => import('./world/WorldRuntime'));
const CampusWorld = lazy(() => import('./three/CampusWorld'));

const CAMPUS_ENTRY_PHASE: Record<string, string> = {
  gary: 'PILOT',
  ghana: 'PILOT',
  guyana: 'PILOT',
  geelong: 'PILOT',
  germany: 'PILOT',
  gaza: 'RECOVERY_NETWORK',
  'graham-land': 'REMOTE_LEARNING_LAB',
};

type Site = 'COMMONS' | 'HOME' | 'TRANSIT' | 'CAMPUS' | 'GALLERY';

function PortalReturn({ href }: { href: string | null }) {
  if (!href) return null;
  return (
    <a className="mlv-portal-return" href={href} aria-label="Return to gunnchOS">
      ← gunnchOS
    </a>
  );
}

function siteForScene(sceneId: string | null): Site {
  if (sceneId === 'commons') return 'COMMONS';
  if (sceneId === 'transit') return 'TRANSIT';
  if (sceneId?.startsWith('home-')) return 'HOME';
  if (sceneId?.startsWith('gallery-')) return 'GALLERY';
  if (sceneId && sceneById(sceneId)?.campusSlug) return 'CAMPUS';
  return 'COMMONS';
}

function siteFromRoute(kind: string | null, sceneId: string | null): Site {
  if (kind === 'scene') return siteForScene(sceneId);
  if (kind === 'commons') return 'COMMONS';
  if (kind === 'home') return 'HOME';
  if (kind === 'transit') return 'TRANSIT';
  if (kind === 'gallery') return 'GALLERY';
  if (kind && ['campus', 'atlas', 'academic', 'library', 'study', 'lecture', 'media', 'research'].includes(kind)) {
    return 'CAMPUS';
  }
  return 'COMMONS';
}

type SessionUser = { id: string; email?: string; user_metadata?: { full_name?: string } };

const LOCAL_TEST_SESSION_KEY = 'mlv.local_test_identity.active';
const LOCAL_TEST_USER: SessionUser = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'alice-local-test@mlv.local',
  user_metadata: { full_name: 'Alice (local test identity)' },
};

export default function App() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [listOpen, setListOpen] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [nodes, setNodes] = useState<MlvNode[]>([]);
  const [placements, setPlacements] = useState<MlvWorldPlacement[]>([]);
  const [homeTheme, setHomeTheme] = useState('cozy');
  const [viewer, setViewer] = useState<{ node: MlvNode; blob: Blob | null } | null>(null);
  const [status, setStatus] = useState('');
  const [route, setRoute] = useState(() => parseMlvDeepLink(window.location.hash || window.location.href));
  const portalHref = portalReturnHref(import.meta.env.VITE_GUNNCHOS_PORTAL_URL);

  const { signInWithGitHub, signOut } = useAuth();
  const remote = useMlvWorkspace();
  const local = useMemo(() => createBrowserWorkspace(), []);

  useEffect(() => {
    const onHash = () => setRoute(parseMlvDeepLink(window.location.hash || window.location.href));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    let unsubscribe = () => {};
    const boot = async () => {
      if (!isSupabaseConfigured && sessionStorage.getItem(LOCAL_TEST_SESSION_KEY) === 'true') {
        setUser(LOCAL_TEST_USER);
        await loadWorkspace(LOCAL_TEST_USER);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user as SessionUser);
        await loadWorkspace(session.user as SessionUser);
      }
    };
    boot();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user as SessionUser);
        loadWorkspace(session.user as SessionUser);
      } else {
        if (!isSupabaseConfigured && sessionStorage.getItem(LOCAL_TEST_SESSION_KEY) === 'true') return;
        setUser(null);
        setNodes([]);
        setPlacements([]);
        setProjects([]);
      }
    });
    unsubscribe = () => subscription.unsubscribe();
    return () => unsubscribe();
  }, []);

  const loadWorkspace = async (sessionUser: SessionUser) => {
    const instance = local.ensurePlayerInstance(sessionUser.id);
    setHomeTheme(instance.home_theme);
    refreshLocal(sessionUser);
    if (!isSupabaseConfigured) {
      setStatus('Persistent local metadata store. Supabase is not configured; owner-only browser isolation remains active and file bytes are session-only.');
      return;
    }
    const { error } = await remote.ensurePlayerInstance();
    if (error) {
      setStatus(`Signed in. Player instance RPC unavailable yet (${error.message}). Using local private store.`);
      return;
    }
    const listed = await remote.listOwnNodes();
    const placed = await remote.listOwnPlacements();
    if (!listed.error) {
      const remoteNodes = listed.data as MlvNode[];
      for (const node of remoteNodes) local.insertNode({ id: sessionUser.id }, node);
      setNodes(remoteNodes);
    }
    if (!placed.error) setPlacements(placed.data as MlvWorldPlacement[]);
    setStatus('Signed in. New uploads default PRIVATE. Hosted workspace sync is active.');
  };

  const refreshLocal = (sessionUser: SessionUser) => {
    setNodes(local.listVisible(sessionUser, sessionUser.id));
    setPlacements(local.listPlacements(sessionUser, sessionUser.id));
  };

  const actor = user ? { id: user.id } : null;
  const activeScene = route.scene_id ? sceneById(route.scene_id) : undefined;
  const site = siteFromRoute(route.kind, route.scene_id);
  const campusSlug = activeScene?.campusSlug || (
    route.kind === 'campus' && route.campus_slug !== 'network-twin' ? route.campus_slug : null
  );
  const worldEntry: WorldEntry = site === 'CAMPUS' ? 'CAMPUS' : site;
  const initialScene = activeScene?.sceneId || null;
  const networkTwinOpen = route.kind === 'campus'
    && (route.campus_slug === 'network-twin' || (route.campus_rest || []).includes('network-twin'));

  const handleUpload = async (file: File) => {
    if (!actor) return;
    const result = await local.uploadPrivate(actor, file);
    if (!result.ok) {
      setStatus(`Upload blocked: ${result.reason}`);
      return;
    }
    refreshLocal({ id: actor.id });
    if (isSupabaseConfigured) {
      const mirrored = await remote.mirrorPrivateUpload(result.node, result.placement, file);
      if (mirrored.error) {
        setStatus(`${file.name} is PRIVATE in this browser; hosted sync failed (${mirrored.error.message}).`);
        return;
      }
    }
    setStatus(`${file.name} saved PRIVATE on your desk${isSupabaseConfigured ? ' and hosted workspace' : ''}.`);
  };

  const handleShare = async (node: MlvNode) => {
    if (!actor) return;
    const result = await local.share(actor, node.id);
    if (!result.ok) return;
    refreshLocal({ id: actor.id });
    let token = result.token;
    let hosted = false;
    if (isSupabaseConfigured) {
      const shared = await remote.createShare(node.id);
      if (!shared.error && shared.data) {
        token = shared.data.token;
        hosted = true;
      }
    }
    const link = `gunnchos://mlv/share/${token}`;
    await navigator.clipboard?.writeText(link).catch(() => undefined);
    setStatus(`${hosted ? 'Hosted' : 'Browser-local'} unlisted share link copied. It is not in public discovery.`);
  };

  const handlePublish = async (node: MlvNode) => {
    if (!actor) return;
    const confirmed = window.confirm(`Publish "${node.name}"? It will become publicly discoverable.`);
    const result = local.publish(actor, node.id, confirmed);
    if (!result.ok) {
      setStatus('Publish cancelled. Node stays private.');
      return;
    }
    refreshLocal({ id: actor.id });
    if (isSupabaseConfigured) {
      const published = await remote.publishNode(node.id, result.node.metadata);
      if (published.error) {
        setStatus(`${node.name} is PUBLIC in this browser; hosted publish failed (${published.error.message}).`);
        return;
      }
    }
    setStatus(`${node.name} is PUBLIC${isSupabaseConfigured ? ' in the hosted workspace' : ''}.`);
  };

  const handleMakePrivate = async (node: MlvNode) => {
    if (!actor) return;
    const result = local.unpublish(actor, node.id);
    if (!result.ok) return;
    refreshLocal({ id: actor.id });
    if (isSupabaseConfigured) {
      const privateResult = await remote.makeNodePrivate(node.id, result.node.metadata);
      if (privateResult.error) {
        setStatus(`${node.name} is PRIVATE in this browser; hosted revoke needs retry (${privateResult.error.message}).`);
        return;
      }
    }
    setStatus(`${node.name} is PRIVATE again. Public access and share links were revoked.`);
  };

  const handleRename = async (node: MlvNode) => {
    if (!actor) return;
    const name = window.prompt('Rename file', node.name);
    if (!name) return;
    local.mutate(actor, node.id, { name });
    refreshLocal({ id: actor.id });
    if (isSupabaseConfigured) await remote.updateNode(node.id, { name });
  };

  const handleDelete = async (node: MlvNode) => {
    if (!actor) return;
    const deletedAt = new Date().toISOString();
    local.mutate(actor, node.id, { deleted_at: deletedAt });
    refreshLocal({ id: actor.id });
    if (isSupabaseConfigured) await remote.updateNode(node.id, { deleted_at: deletedAt });
  };

  const handleOpen = async (node: MlvNode) => {
    let blob = actor ? local.blobFor(actor, node.id) : null;
    if (!blob && actor && isSupabaseConfigured && node.owner_id === actor.id) {
      const downloaded = await remote.downloadOwnNode(node);
      if (!downloaded.error) blob = downloaded.data;
    }
    setViewer({ node, blob });
  };

  const navigateToScene = useCallback((sceneId: WorldSceneId) => {
    window.location.hash = `#/mlv/scene/${encodeURIComponent(sceneId)}`;
  }, []);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      setStatus(`Sign out failed: ${error.message}`);
      return;
    }
    setUser(null);
    setNodes([]);
    setPlacements([]);
    setProjects([]);
    setViewer(null);
    sessionStorage.removeItem(LOCAL_TEST_SESSION_KEY);
  };

  useEffect(() => {
    if (!user || route.kind !== 'share' || !route.share_token) return;
    let cancelled = false;
    void (async () => {
      const localShared = await local.openShare(route.share_token!);
      if (localShared.ok && localShared.node && localShared.shareContext) {
        if (!cancelled) {
          setViewer({ node: localShared.node, blob: local.blobFor(null, localShared.node.id, localShared.shareContext) });
          setStatus('Opened an unlisted shared node. The bearer token was not added to public discovery.');
        }
        return;
      }
      if (isSupabaseConfigured) {
        const hosted = await remote.openShare(route.share_token!);
        const row = Array.isArray(hosted.data) ? hosted.data[0] : null;
        if (!hosted.error && row && !cancelled) {
          const sharedNode: MlvNode = {
            ...row,
            sha256: null,
            storage_key: null,
            created_at: new Date(0).toISOString(),
            updated_at: new Date(0).toISOString(),
            deleted_at: null,
          } as MlvNode;
          setViewer({ node: sharedNode, blob: null });
          setStatus('Opened a hosted unlisted share. Private storage bytes remain protected by the backend boundary.');
          return;
        }
      }
      if (!cancelled) setStatus('Share link is unknown, expired, revoked, or unavailable in this environment.');
    })();
    return () => { cancelled = true; };
  }, [route.kind, route.share_token, user, local]);

  useEffect(() => {
    if (!user || !route.node_id || !['node', 'public'].includes(route.kind || '')) return;
    const node = nodes.find((candidate) => candidate.id === route.node_id);
    if (!node || (route.kind === 'public' && node.visibility !== 'public')) {
      setStatus('Requested node is unavailable for this identity and visibility state.');
      return;
    }
    const blob = actor ? local.blobFor(actor, node.id) : null;
    setViewer({ node, blob });
  }, [route.kind, route.node_id, user, nodes, actor?.id, local]);

  if (!user) {
    return (
      <main className="mlv-sign-in">
        <PortalReturn href={portalHref} />
        <h1>3k MLV</h1>
        <h2>My Little Vicinity</h2>
        <p>A private-by-default gunnchOS world workspace. New files start PRIVATE.</p>
        {!isSupabaseConfigured && (
          <p className="mlv-warning">
            Supabase env is not configured. GitHub OAuth will not complete until
            <code> VITE_SUPABASE_URL </code> and <code> VITE_SUPABASE_ANON_KEY </code> are set.
          </p>
        )}
        <button type="button" onClick={() => signInWithGitHub()}>Sign in with GitHub</button>
        {!isSupabaseConfigured && (
          <button
            type="button"
            onClick={() => {
              sessionStorage.setItem(LOCAL_TEST_SESSION_KEY, 'true');
              setUser(LOCAL_TEST_USER);
              void loadWorkspace(LOCAL_TEST_USER);
              setStatus('Local test identity only. Not production GitHub OAuth.');
            }}
          >
            Enter local test identity
          </button>
        )}
        {route.valid && route.kind && (
          <p>Pending route: {route.kind}{route.node_id ? ` ${route.node_id}` : ''}</p>
        )}
      </main>
    );
  }

  return (
    <div className="mlv-shell">
      <header className="mlv-topbar">
        <div>
          <h1>3k MLV</h1>
          <p>Welcome back, {user.user_metadata?.full_name || user.email}</p>
        </div>
        <div className="mlv-topbar__actions">
          <PortalReturn href={portalHref} />
          <nav className="mlv-site-nav" aria-label="World sites">
            <button type="button" aria-current={site === 'COMMONS' ? 'page' : undefined} onClick={() => navigateToScene('commons')}>Commons</button>
            <button type="button" aria-current={site === 'HOME' ? 'page' : undefined} onClick={() => navigateToScene('home-yard')}>Home</button>
            <button type="button" aria-current={site === 'GALLERY' ? 'page' : undefined} onClick={() => navigateToScene('gallery-lobby')}>Gallery</button>
            <button type="button" aria-current={site === 'TRANSIT' || site === 'CAMPUS' ? 'page' : undefined} onClick={() => navigateToScene('transit')}>Campus Transit</button>
          </nav>
          <button type="button" onClick={() => setListOpen((v) => !v)}>
            {listOpen ? 'Hide files' : 'Files (list view)'}
          </button>
          <button type="button" onClick={() => setPhoneOpen(true)}>Phone</button>
          <button type="button" onClick={() => { void handleSignOut(); }}>Sign out</button>
        </div>
      </header>
      <p className="mlv-status" role="status">{status}</p>
      <p className="mlv-offline">
        {describeOffline({
          shellReady: true,
          recentMetadataCached: local.persistenceStatus().metadataPersisted,
          pinnedBytesAvailable: false,
          queuedChanges: 0,
          socialDegraded: !isSupabaseConfigured,
        })}
      </p>
      <p className="mlv-kicker">Home theme: {homeTheme} · visible placements: {placements.length}</p>
      <div className="mlv-stage">
        <Suspense fallback={<p className="mlv-campus">Loading world…</p>}>
          <WorldRuntime
            initialWorld={worldEntry}
            initialScene={initialScene}
            campusSlug={campusSlug || undefined}
            onStatus={setStatus}
            onSceneChange={navigateToScene}
            onSignOut={handleSignOut}
            onPrivateFile={() => setListOpen(true)}
            onPublicFile={() => {
              document.getElementById('wing-public')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            onGallery={(destination) => {
              const id = destination.startsWith('#') ? destination.slice(1) : destination;
              document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            onNetworkTwin={(destination) => {
              if (destination.startsWith('#')) window.location.hash = destination;
            }}
            massing={(activeScene?.sceneKind === 'campus-arrival' || (route.kind === 'campus' && !networkTwinOpen)) && campusSlug ? (
              <CampusWorld slug={campusSlug} phaseId={CAMPUS_ENTRY_PHASE[campusSlug] || 'PILOT'} />
            ) : undefined}
          />
        </Suspense>
        {site === 'HOME' && listOpen && (
          <ListWorkspace
            nodes={nodes.filter((n) => !n.deleted_at)}
            onOpen={handleOpen}
            onShare={handleShare}
            onPublish={handlePublish}
            onMakePrivate={handleMakePrivate}
            onRename={handleRename}
            onDelete={handleDelete}
            onUpload={handleUpload}
          />
        )}
        <Suspense fallback={<p className="mlv-campus">Loading supporting surface…</p>}>
            {site === 'GALLERY' && (
              actor &&
              <GallerySite
                nodes={nodes}
                actor={actor}
                onWorkingCopy={(node) => {
                  local.insertNode(actor, node);
                  refreshLocal({ id: actor.id });
                  if (isSupabaseConfigured) void remote.mirrorNode(node);
                  setStatus(`${node.name} saved as a private working copy. It is not public.`);
                }}
                onCreatePrivate={(node) => {
                  local.insertNode(actor, node);
                  refreshLocal({ id: actor.id });
                  if (isSupabaseConfigured) void remote.mirrorNode(node);
                  setStatus(`${node.name} is in My Gallery and stays private.`);
                }}
                onPublish={async (node, wing) => {
                  const confirmed = window.confirm(`Publish "${node.name}" to ${wing === 'exchange_7gc' ? '7GC Exchange' : 'Public Community Gallery'}?`);
                  const result = local.publishGallery(actor, node.id, confirmed, wing);
                  if (!result.ok) {
                    setStatus('Publish cancelled. My Gallery file stays private.');
                    return;
                  }
                  refreshLocal({ id: actor.id });
                  if (isSupabaseConfigured) {
                    const published = await remote.publishNode(node.id, result.node.metadata);
                    if (published.error) {
                      setStatus(`${node.name} is published locally; hosted publish failed (${published.error.message}).`);
                      return;
                    }
                  }
                  setStatus(`${node.name} is published. Public wings only show confirmed assets.`);
                }}
              />
            )}
            {site === 'CAMPUS' && route.kind === 'atlas' && <Atlas />}
            {site === 'CAMPUS' && route.kind === 'academic' && (
              <section className="mlv-campus"><WaikeCenter /></section>
            )}
            {site === 'CAMPUS' && route.kind === 'library' && <Library />}
            {site === 'CAMPUS' && route.kind === 'study' && actor && <StudyRooms actor={actor} />}
            {site === 'CAMPUS' && route.kind === 'lecture' && <LectureHall />}
            {site === 'CAMPUS' && route.kind === 'media' && <MediaCenter />}
            {site === 'CAMPUS' && route.kind === 'research' && route.research_id && <ResearchSurface projectId={route.research_id} />}
            {site === 'CAMPUS' && networkTwinOpen && <NetworkTwinLab slug={campusSlug} />}
            {site === 'CAMPUS' && route.kind === 'campus' && campusSlug && !networkTwinOpen && <DigitalCampus slug={campusSlug} />}
            {site === 'CAMPUS' && route.kind === 'scene' && campusSlug && <DigitalCampus slug={campusSlug} />}
            {site === 'CAMPUS' && route.kind === 'campus' && !campusSlug && !networkTwinOpen && <CampusLanding />}
        </Suspense>
      </div>
      <Phone
        isOpen={phoneOpen}
        onClose={() => setPhoneOpen(false)}
        projects={projects}
      />
      {viewer && (
        <FileViewer node={viewer.node} blob={viewer.blob} onClose={() => setViewer(null)} />
      )}
    </div>
  );
}
