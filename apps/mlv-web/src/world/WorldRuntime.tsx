import { Canvas } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import AccessibilityDirectNav from './AccessibilityDirectNav';
import AvatarController from './AvatarController';
import InteractionPrompt from './InteractionPrompt';
import MobileControls from './MobileControls';
import ThirdPersonCamera from './ThirdPersonCamera';
import TransitionManager from './TransitionManager';
import WorldGeometry from './WorldGeometry';
import { runInteraction } from './InteractionSystem';
import { nearestInteractable } from './ProximitySystem';
import { loadWorldState, saveWorldState } from './WorldState';
import { readReturnContext } from './ReturnContext';
import { CAMPUS_WORLDS, GALLERY_WORLD, HOME_WORLD, worldForCampusSlug } from './worldDefs';
import type { WorldDefinition } from './worldDefs';
import type { WorldInteractable, WorldMode } from './types';

type Props = {
  initialWorld?: 'HOME' | 'GALLERY' | 'CAMPUS';
  campusSlug?: string;
  onStatus?: (msg: string) => void;
  planningSlot?: React.ReactNode;
  /** Place-specific campus massing. When set, the generic shell is not drawn. */
  massing?: React.ReactNode;
};

function defFor(initialWorld: Props['initialWorld'], campusSlug?: string): WorldDefinition {
  if (initialWorld === 'GALLERY') return GALLERY_WORLD;
  if (initialWorld === 'CAMPUS') return worldForCampusSlug(campusSlug || 'gary');
  return HOME_WORLD;
}

export default function WorldRuntime({ initialWorld = 'HOME', campusSlug, onStatus, planningSlot, massing }: Props) {
  const worldDef = useMemo(() => defFor(initialWorld, campusSlug), [initialWorld, campusSlug]);
  const [mode, setMode] = useState<WorldMode>('WORLD');
  const [pos, setPos] = useState<[number, number, number]>(worldDef.spawn);
  const [facing, setFacing] = useState(Math.PI);
  const [move, setMove] = useState({ x: 0, y: 0 });
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [seated, setSeated] = useState(false);
  const [transition, setTransition] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const saved = loadWorldState();
    setReducedMotion(!!saved.reducedMotion || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
    const ctx = readReturnContext();
    if (ctx && ctx.world === worldDef.id) {
      setPos(ctx.avatarPosition);
      setFacing(ctx.avatarFacing);
      onStatus?.(`Restored return context at ${ctx.anchor}`);
    } else {
      setPos(worldDef.spawn);
    }
  }, [worldDef, onStatus]);

  useEffect(() => {
    saveWorldState({
      mode, world: worldDef.id, zone: 'ACTIVE', avatarPosition: pos, avatarFacing: facing,
      seated, screenPower: false, returnContext: readReturnContext(), reducedMotion,
    });
  }, [mode, worldDef.id, pos, facing, seated, reducedMotion]);

  const near = nearestInteractable(pos, worldDef.interactables);

  const activate = useCallback((item: WorldInteractable) => {
    const ctx = {
      world: worldDef.id,
      zone: item.worldReturnAnchor,
      anchor: item.worldReturnAnchor,
      avatarPosition: pos,
      avatarFacing: facing,
      session: `mlv-${Date.now()}`,
    };
    if (item.capability === 'SEAT') setSeated((v) => !v);
    if (item.capability === 'DOOR' || item.capability === 'ROOM_TRANSITION') {
      setTransition(true);
      setTimeout(() => setTransition(false), reducedMotion ? 0 : 350);
    }
    if (item.capability === 'GALLERY_EXHIBIT' && item.destination?.startsWith('#')) {
      window.location.hash = item.destination;
    }
    if (item.capability === 'NETWORK_TWIN' && item.destination?.startsWith('#')) {
      window.location.hash = item.destination;
    }
    if (item.capability === 'WAIKE_LEARNER') {
      onStatus?.(`WAIKE binding: ${item.destination} (source-of-record; no invented coursework)`);
    }
    if (item.capability === 'PUBLIC_FILE') {
      onStatus?.(`Opening PUBLIC file surface only — private leak count must stay 0`);
    }
    if (item.capability === 'PRIVATE_FILE') {
      onStatus?.(`Private/My Gallery surface — not published to public wing`);
    }
    runInteraction(item, ctx, { onStatus });
  }, [worldDef.id, pos, facing, reducedMotion, onStatus]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') {
        if (near) activate(near);
      }
      if (e.key === 'Escape') setSeated(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [near, activate]);

  return (
    <section aria-label={`${worldDef.title} world runtime`} style={{ position: 'relative' }}>
      <div className="mlv-toolbar" role="toolbar" aria-label="World mode">
        <button type="button" className="mlv-chip" aria-pressed={mode === 'WORLD'} onClick={() => setMode('WORLD')}>WORLD</button>
        <button type="button" className="mlv-chip" aria-pressed={mode === 'MAP'} onClick={() => setMode('MAP')}>MAP</button>
        <button type="button" className="mlv-chip" aria-pressed={mode === 'LIST'} onClick={() => setMode('LIST')}>LIST</button>
        <span className="mlv-kicker">{worldDef.title} — {worldDef.identity}</span>
      </div>

      {mode === 'LIST' && (
        <AccessibilityDirectNav items={worldDef.interactables} onSelect={activate} />
      )}

      {mode === 'MAP' && (
        <div className="mlv-campus-map" style={{ height: 'min(62vh, 520px)', borderRadius: 12, overflow: 'hidden' }}>
          {planningSlot || <p className="mlv-kicker">Planning / digital-twin map mode.</p>}
        </div>
      )}

      {mode === 'WORLD' && (
        <div style={{ height: 'min(70vh, 640px)', borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
          <Canvas camera={{ position: [0, 3, 8], fov: 55 }} style={{ width: '100%', height: '100%' }}>
            <ambientLight intensity={0.55} />
            <directionalLight position={[8, 14, 6]} intensity={1.0} />
            <Suspense fallback={null}>
              {massing || <WorldGeometry props={worldDef.props} />}
              <AvatarController
                position={pos}
                facing={facing}
                onChange={(p, f) => { setPos(p); setFacing(f); }}
                collisions={worldDef.collisions}
                moveInput={move}
                lookInput={look}
                seated={seated}
              />
              <ThirdPersonCamera target={[pos[0], pos[1], pos[2]]} yaw={facing} reducedMotion={reducedMotion} />
            </Suspense>
          </Canvas>
          <MobileControls
            onMove={(x, y) => setMove({ x, y })}
            onLook={(x, y) => setLook({ x, y })}
            onInteract={() => { if (near) activate(near); }}
            onBack={() => setSeated(false)}
          />
          <InteractionPrompt visible={!!near} verb={near?.verb || ''} label={near?.label || ''} />
          <TransitionManager active={transition} label={`Entering ${worldDef.title}`} />
        </div>
      )}
      <p className="mlv-kicker">WORLD mode uses authored assemblies (doors/windows/roof/furniture). MAP keeps planning massing. PHYSICAL_EDGE_IO_RINGS_VALIDATION_PENDING.</p>
      {/* silence unused import in bundlers that tree-shake poorly */}
      <span hidden>{Object.keys(CAMPUS_WORLDS).length}</span>
    </section>
  );
}
