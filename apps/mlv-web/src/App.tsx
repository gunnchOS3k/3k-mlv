import { useEffect, useMemo, useState } from 'react';
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
import World from './three/World';
import Phone from './ui/Phone';
import ListWorkspace from './ui/ListWorkspace';
import FileViewer from './ui/FileViewer';
import { createBrowserWorkspace } from './workspace/browserStore';
import { describeOffline } from './workspace/offline';

type SessionUser = { id: string; email?: string; user_metadata?: { full_name?: string } };

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
      setStatus('Local prototype store. Supabase is not configured — owner-only isolation still applies in-memory.');
      return;
    }
    const { error } = await remote.ensurePlayerInstance();
    if (error) {
      setStatus(`Signed in. Player instance RPC unavailable yet (${error.message}). Using local private store.`);
      return;
    }
    const listed = await remote.listOwnNodes();
    if (!listed.error && listed.data.length) {
      setNodes(listed.data as MlvNode[]);
    }
    setStatus('Signed in. New uploads default PRIVATE.');
  };

  const refreshLocal = (sessionUser: SessionUser) => {
    setNodes(local.listVisible(sessionUser, sessionUser.id));
    setPlacements(local.listPlacements(sessionUser, sessionUser.id));
  };

  const actor = user ? { id: user.id } : null;

  const handleUpload = async (file: File) => {
    if (!actor) return;
    const result = await local.uploadPrivate(actor, file);
    if (!result.ok) {
      setStatus(`Upload blocked: ${result.reason}`);
      return;
    }
    refreshLocal({ id: actor.id });
    setStatus(`${file.name} saved PRIVATE on your desk.`);
  };

  const handleShare = async (node: MlvNode) => {
    if (!actor) return;
    const result = await local.share(actor, node.id);
    if (!result.ok) return;
    refreshLocal({ id: actor.id });
    const link = `gunnchos://mlv/share/${result.token}`;
    await navigator.clipboard?.writeText(link).catch(() => undefined);
    setStatus('Unlisted share link copied. It is not in public discovery.');
  };

  const handlePublish = (node: MlvNode) => {
    if (!actor) return;
    const confirmed = window.confirm(`Publish "${node.name}"? It will become publicly discoverable.`);
    const result = local.publish(actor, node.id, confirmed);
    if (!result.ok) {
      setStatus('Publish cancelled. Node stays private.');
      return;
    }
    refreshLocal({ id: actor.id });
    setStatus(`${node.name} is PUBLIC.`);
  };

  const handleMakePrivate = (node: MlvNode) => {
    if (!actor) return;
    local.unpublish(actor, node.id);
    refreshLocal({ id: actor.id });
    setStatus(`${node.name} is PRIVATE again. Public access and share links were revoked.`);
  };

  const handleRename = (node: MlvNode) => {
    if (!actor) return;
    const name = window.prompt('Rename file', node.name);
    if (!name) return;
    local.mutate(actor, node.id, { name });
    refreshLocal({ id: actor.id });
  };

  const handleDelete = (node: MlvNode) => {
    if (!actor) return;
    local.mutate(actor, node.id, { deleted_at: new Date().toISOString() });
    refreshLocal({ id: actor.id });
  };

  const handleOpen = (node: MlvNode) => {
    const blob = actor ? local.blobFor(actor, node.id) : null;
    setViewer({ node, blob });
  };

  if (!user) {
    return (
      <main className="mlv-sign-in">
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
              const localUser = {
                id: '11111111-1111-4111-8111-111111111111',
                email: 'alice-local-test@mlv.local',
                user_metadata: { full_name: 'Alice (local test identity)' },
              };
              setUser(localUser);
              void loadWorkspace(localUser);
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
          <button type="button" onClick={() => setListOpen((v) => !v)}>
            {listOpen ? 'Hide files' : 'Files (list view)'}
          </button>
          <button type="button" onClick={() => setPhoneOpen(true)}>Phone</button>
          <button type="button" onClick={() => signOut()}>Sign out</button>
        </div>
      </header>
      <p className="mlv-status" role="status">{status}</p>
      <p className="mlv-offline">
        {describeOffline({
          shellReady: true,
          recentMetadataCached: true,
          pinnedBytesAvailable: false,
          queuedChanges: 0,
          socialDegraded: !isSupabaseConfigured,
        })}
      </p>
      <div className="mlv-stage">
        <World homeTheme={homeTheme} placements={placements} nodes={nodes} onOpenNode={handleOpen} />
        {listOpen && (
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
