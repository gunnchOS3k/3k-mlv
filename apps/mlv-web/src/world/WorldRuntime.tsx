import { Canvas } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import AccessibilityDirectNav from './AccessibilityDirectNav';
import AvatarController from './AvatarController';
import { gamepadButtonEdges, readGamepad } from './GamepadControls';
import type { PadAxes } from './GamepadControls';
import InteractionPrompt from './InteractionPrompt';
import MobileControls from './MobileControls';
import ThirdPersonCamera from './ThirdPersonCamera';
import TransitionManager from './TransitionManager';
import WorldGeometry from './WorldGeometry';
import { runInteraction } from './InteractionSystem';
import { nearestInteractable } from './ProximitySystem';
import { loadWorldState, saveWorldState } from './WorldState';
import { readReturnContext } from './ReturnContext';
import { entrySceneForWorld, sceneById } from './worldDefs';
import type { WorldDefinition, WorldEntry, WorldInteractable, WorldMode, WorldSceneId } from './types';

type Props = {
  initialWorld?: WorldEntry;
  initialScene?: WorldSceneId | null;
  campusSlug?: string;
  onStatus?: (message: string) => void;
  onSceneChange?: (sceneId: WorldSceneId) => void;
  onSignOut?: () => void | Promise<void>;
  onPrivateFile?: (destination: string) => void;
  onPublicFile?: (destination: string) => void;
  onGallery?: (destination: string) => void;
  onNetworkTwin?: (destination: string) => void;
  planningSlot?: ReactNode;
  /** Optional accepted-main exterior massing for an arrival scene. */
  massing?: ReactNode;
};

function initialDefinition(initialWorld: WorldEntry, initialScene: WorldSceneId | null | undefined, campusSlug?: string): WorldDefinition {
  return (initialScene ? sceneById(initialScene) : undefined)
    || entrySceneForWorld(initialWorld, campusSlug);
}

export default function WorldRuntime({
  initialWorld = 'COMMONS',
  initialScene,
  campusSlug,
  onStatus,
  onSceneChange,
  onSignOut,
  onPrivateFile,
  onPublicFile,
  onGallery,
  onNetworkTwin,
  planningSlot,
  massing,
}: Props) {
  const requestedDefinition = useMemo(
    () => initialDefinition(initialWorld, initialScene, campusSlug),
    [initialWorld, initialScene, campusSlug],
  );
  const [sceneId, setSceneId] = useState<WorldSceneId>(requestedDefinition.sceneId);
  const worldDef = sceneById(sceneId) || requestedDefinition;
  const [mode, setMode] = useState<WorldMode>('WORLD');
  const [pos, setPos] = useState<[number, number, number]>(worldDef.spawn);
  const [facing, setFacing] = useState(Math.PI);
  const [pitch, setPitch] = useState(0.35);
  const [move, setMove] = useState({ x: 0, y: 0 });
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [seated, setSeated] = useState(false);
  const [transition, setTransition] = useState(false);
  const [transitionLabel, setTransitionLabel] = useState('Entering…');
  const [reducedMotion, setReducedMotion] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const target = requestedDefinition;
    setSceneId(target.sceneId);
    const saved = loadWorldState(target.id);
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
    setReducedMotion(saved.reducedMotion || prefersReducedMotion);
    const returnContext = readReturnContext();
    if (returnContext && returnContext.world === target.id && returnContext.zone === target.sceneId) {
      setMode(saved.mode);
      setPos(returnContext.avatarPosition);
      setFacing(returnContext.avatarFacing);
      setSeated(false);
      onStatus?.(`Restored ${target.title} at ${returnContext.anchor}.`);
    } else if (saved.world === target.id && saved.zone === target.sceneId) {
      setMode(saved.mode);
      setPos(saved.avatarPosition);
      setFacing(saved.avatarFacing);
      setSeated(saved.seated);
      onStatus?.(`Restored saved position in ${target.title}.`);
    } else {
      setPos(target.spawn);
      setFacing(Math.PI);
      setSeated(false);
    }
  }, [requestedDefinition, onStatus]);

  useEffect(() => {
    saveWorldState({
      mode,
      world: worldDef.id,
      zone: worldDef.sceneId,
      avatarPosition: pos,
      avatarFacing: facing,
      seated,
      screenPower: false,
      returnContext: readReturnContext(),
      reducedMotion,
    });
  }, [mode, worldDef.id, worldDef.sceneId, pos, facing, seated, reducedMotion]);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [sceneId]);

  const near = nearestInteractable(pos, worldDef.interactables);

  const navigateToScene = useCallback((targetSceneId: string) => {
    const target = sceneById(targetSceneId);
    if (!target) {
      onStatus?.(`Navigation blocked: unknown scene ${targetSceneId}.`);
      return;
    }
    setTransitionLabel(`Entering ${target.title}`);
    setTransition(true);
    const complete = () => {
      setSceneId(target.sceneId);
      setPos(target.spawn);
      setFacing(Math.PI);
      setPitch(0.35);
      setSeated(false);
      setMove({ x: 0, y: 0 });
      setLook({ x: 0, y: 0 });
      setTransition(false);
      onSceneChange?.(target.sceneId);
      onStatus?.(`Entered ${target.title}.`);
    };
    if (reducedMotion) complete();
    else window.setTimeout(complete, 280);
  }, [onSceneChange, onStatus, reducedMotion]);

  const activate = useCallback((item: WorldInteractable) => {
    const returnContext = {
      world: worldDef.id,
      zone: worldDef.sceneId,
      anchor: item.worldReturnAnchor,
      avatarPosition: pos,
      avatarFacing: facing,
      session: `mlv-${Date.now()}`,
    };
    runInteraction(item, returnContext, {
      onNavigate: navigateToScene,
      onSeat: () => {
        setSeated((value) => !value);
        onStatus?.(seated ? 'Stood up.' : `Seated at ${item.label}.`);
      },
      onDoor: () => onStatus?.(`${item.label} has no configured destination.`),
      onRoom: (destination) => onStatus?.(`Room target ${destination} is not part of the authoritative graph.`),
      onPrivateFile: (destination) => {
        onPrivateFile?.(destination);
        onStatus?.('Opened the owner-private workspace. Nothing was published.');
      },
      onPublicFile: (destination) => {
        onPublicFile?.(destination);
        onStatus?.('Opened explicitly published public content only.');
      },
      onGallery: (destination) => {
        onGallery?.(destination);
        onStatus?.('Opened the source-backed gallery surface.');
      },
      onNetworkTwin: (destination) => {
        if (onNetworkTwin) onNetworkTwin(destination);
        else if (destination.startsWith('#')) window.location.hash = destination;
      },
      onLogoff: onSignOut,
      onStatus,
    });
  }, [worldDef.id, worldDef.sceneId, pos, facing, navigateToScene, onStatus, seated, onPrivateFile, onPublicFile, onGallery, onNetworkTwin, onSignOut]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const interactiveElement = event.target instanceof HTMLElement
        && ['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName);
      if ((event.key === 'e' || event.key === 'E' || event.key === 'Enter') && !(interactiveElement && event.key === 'Enter')) {
        if (near) {
          event.preventDefault();
          activate(near);
        }
      }
      if (event.key === 'Escape') {
        setSeated(false);
        setMove({ x: 0, y: 0 });
        setLook({ x: 0, y: 0 });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [near, activate]);

  useEffect(() => {
    let frame = 0;
    let previous: PadAxes | null = null;
    const poll = () => {
      const current = readGamepad();
      const edges = gamepadButtonEdges(previous, current);
      if (edges.interactPressed && near) activate(near);
      if (edges.backPressed) {
        setSeated(false);
        setMove({ x: 0, y: 0 });
        setLook({ x: 0, y: 0 });
      }
      previous = current;
      frame = window.requestAnimationFrame(poll);
    };
    frame = window.requestAnimationFrame(poll);
    return () => window.cancelAnimationFrame(frame);
  }, [near, activate]);

  return (
    <section
      aria-label={`${worldDef.title} world runtime`}
      data-world-runtime="authoritative"
      data-scene-id={worldDef.sceneId}
      style={{ position: 'relative' }}
    >
      <h2 ref={headingRef} tabIndex={-1} className="mlv-world-heading">{worldDef.title}</h2>
      <p className="mlv-kicker">{worldDef.identity}</p>
      <div className="mlv-toolbar" role="toolbar" aria-label="World mode and motion settings">
        <button type="button" className="mlv-chip" aria-pressed={mode === 'WORLD'} onClick={() => setMode('WORLD')}>WORLD</button>
        <button type="button" className="mlv-chip" aria-pressed={mode === 'MAP'} onClick={() => setMode('MAP')}>MAP</button>
        <button type="button" className="mlv-chip" aria-pressed={mode === 'LIST'} onClick={() => setMode('LIST')}>LIST</button>
        <button type="button" className="mlv-chip" aria-pressed={reducedMotion} onClick={() => setReducedMotion((value) => !value)}>
          Reduced motion {reducedMotion ? 'on' : 'off'}
        </button>
        <span className="mlv-kicker">Scene: {worldDef.sceneId}</span>
      </div>

      {mode === 'LIST' && <AccessibilityDirectNav items={worldDef.interactables} onSelect={activate} />}

      {mode === 'MAP' && (
        <div className="mlv-campus-map mlv-world-map" aria-label={`${worldDef.title} route map`}>
          {planningSlot || (
            <>
              <h3>Routes from {worldDef.title}</h3>
              <ul>
                {worldDef.portals.map((portal) => <li key={portal.id}>{portal.label}</li>)}
              </ul>
            </>
          )}
        </div>
      )}

      {mode === 'WORLD' && (
        <div
          className="mlv-world-canvas"
          aria-label={`${worldDef.title} interactive 3D scene. Use W A S D or arrow keys to move, E or Enter to interact, and Escape to go back.`}
          tabIndex={0}
          style={{ height: 'min(70vh, 640px)', borderRadius: 12, overflow: 'hidden', position: 'relative' }}
        >
          <Canvas camera={{ position: [0, 3, 8], fov: 55 }} style={{ width: '100%', height: '100%' }}>
            <ambientLight intensity={0.58} />
            <hemisphereLight args={['#dbeafe', '#292524', 0.42]} />
            <directionalLight position={[8, 14, 6]} intensity={1.05} />
            <Suspense fallback={null}>
              {massing || <WorldGeometry props={worldDef.props} />}
              <AvatarController
                position={pos}
                facing={facing}
                onChange={(nextPosition, nextFacing) => { setPos(nextPosition); setFacing(nextFacing); }}
                collisions={worldDef.collisions}
                moveInput={move}
                lookInput={look}
                pitch={pitch}
                onPitchChange={setPitch}
                seated={seated}
              />
              <ThirdPersonCamera target={pos} yaw={facing} pitch={pitch} reducedMotion={reducedMotion} />
            </Suspense>
          </Canvas>
          <MobileControls
            onMove={(x, y) => setMove({ x, y })}
            onLook={(x, y) => setLook({ x, y })}
            onInteract={() => { if (near) activate(near); }}
            onBack={() => {
              setSeated(false);
              setMove({ x: 0, y: 0 });
              setLook({ x: 0, y: 0 });
            }}
          />
          <InteractionPrompt
            visible={Boolean(near)}
            verb={near?.verb || ''}
            label={near?.label || ''}
            onActivate={near ? () => activate(near) : undefined}
          />
          <TransitionManager active={transition} label={transitionLabel} />
        </div>
      )}
      <p className="mlv-kicker">
        Authored V1 scene · keyboard, pointer, touch, gamepad, and direct-list actions share one interaction path.
        {' '}Truth: {worldDef.truth.note}
      </p>
      <details>
        <summary>Scene provenance and controls</summary>
        <p>{worldDef.provenance.join(' · ')}</p>
        <p>Move: W/A/S/D, arrows, left stick, or touch. Look: right stick or touch. Interact: E, Enter, pointer, A/cross, or INTERACT. Back: Escape, B/circle, or BACK.</p>
      </details>
    </section>
  );
}
