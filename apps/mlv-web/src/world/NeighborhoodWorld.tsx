import { useEffect, useLayoutEffect, useRef, useState, type MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import SceneBody, { type Portal, type Scene, asSceneMap } from './buildScene';
import { SCENES } from './sceneGraph.mjs';

/** @deprecated Development review only. App.tsx ships WorldRuntime exclusively. */

const scenes = asSceneMap(SCENES);

function isTyping(event: KeyboardEvent) {
  const tag = (event.target as HTMLElement | null)?.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA';
}

function keyDir(key: string) {
  const value = key.toLowerCase();
  if (value === 'w' || value === 'arrowup') return { x: 0, z: -1 };
  if (value === 's' || value === 'arrowdown') return { x: 0, z: 1 };
  if (value === 'a' || value === 'arrowleft') return { x: -1, z: 0 };
  if (value === 'd' || value === 'arrowright') return { x: 1, z: 0 };
  return null;
}

function interiorScene(kind: string) {
  return kind === 'house-room' || kind === 'campus-lobby' || kind === 'campus-lab' || kind === 'campus-gallery';
}

function FrameAndFollow({ scene, moved }: { scene: Scene; moved: MutableRefObject<boolean> }) {
  const { camera } = useThree();
  useLayoutEffect(() => {
    camera.position.set(...scene.frame.position);
    camera.lookAt(...scene.frame.lookAt);
    moved.current = false;
  }, [camera, moved, scene]);
  return null;
}

function Walker({
  scene,
  moved,
  onEnter,
  onNear,
}: {
  scene: Scene;
  moved: MutableRefObject<boolean>;
  onEnter: (id: string) => void;
  onNear: (portal: Portal | null) => void;
}) {
  const { camera } = useThree();
  const group = useRef<THREE.Group>(null);
  const pos = useRef(new THREE.Vector3(...scene.spawn));
  const hold = useRef({ x: 0, z: 0 });
  const queued = useRef({ x: 0, z: 0 });
  const nearId = useRef<string | null>(null);
  const snapped = useRef(false);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (isTyping(event)) return;
      if (event.key.toLowerCase() === 'e') {
        event.preventDefault();
        const portal = nearest(pos.current, scene.portals);
        if (portal) onEnter(portal.to);
        return;
      }
      const dir = keyDir(event.key);
      if (!dir) return;
      event.preventDefault();
      hold.current = dir;
      if (!event.repeat) queued.current = { x: dir.x * 1.6, z: dir.z * 1.6 };
    };
    const up = (event: KeyboardEvent) => {
      if (!keyDir(event.key)) return;
      hold.current = { x: 0, z: 0 };
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [onEnter, scene.portals]);

  useFrame((_, dt) => {
    const tap = queued.current;
    queued.current = { x: 0, z: 0 };
    const speed = 4.4 * Math.min(dt, 0.05);
    const dx = hold.current.x * speed + tap.x;
    const dz = hold.current.z * speed + tap.z;
    if (dx || dz) {
      moved.current = true;
      pos.current.x = THREE.MathUtils.clamp(pos.current.x + dx, scene.bounds.minX, scene.bounds.maxX);
      pos.current.z = THREE.MathUtils.clamp(pos.current.z + dz, scene.bounds.minZ, scene.bounds.maxZ);
      if (group.current) {
        group.current.visible = true;
        group.current.position.copy(pos.current);
        group.current.rotation.y = Math.atan2(dx, dz);
      }
    }
    const portal = nearest(pos.current, scene.portals);
    const nextId = portal?.id ?? null;
    if (nextId !== nearId.current) {
      nearId.current = nextId;
      onNear(portal);
    }
    if (!moved.current) return;
    const inside = interiorScene(scene.kind);
    const desired = new THREE.Vector3(
      pos.current.x,
      inside ? 2.2 : 5.6,
      pos.current.z + (inside ? 2.7 : 8),
    );
    if (!snapped.current) {
      camera.position.copy(desired);
      snapped.current = true;
    } else {
      camera.position.lerp(desired, 1 - Math.pow(0.04, dt));
    }
    camera.lookAt(pos.current.x, 1.15, pos.current.z - (inside ? 1.4 : 2));
  });

  return (
    <group ref={group} position={scene.spawn} visible={false}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <capsuleGeometry args={[0.28, 0.62, 4, 8]} />
        <meshStandardMaterial color="#f2c14e" />
      </mesh>
    </group>
  );
}

function nearest(pos: THREE.Vector3, portals: Portal[]) {
  let best: Portal | null = null;
  let bestD = Infinity;
  for (const portal of portals) {
    const d = Math.hypot(pos.x - portal.position[0], pos.z - portal.position[2]);
    if (d <= portal.radius && d < bestD) {
      best = portal;
      bestD = d;
    }
  }
  return best;
}

function Stage({
  scene,
  onEnter,
  onNear,
}: {
  scene: Scene;
  onEnter: (id: string) => void;
  onNear: (portal: Portal | null) => void;
}) {
  const moved = useRef(false);
  return (
    <>
      <color attach="background" args={[scene.sky]} />
      <ambientLight intensity={0.62} />
      <directionalLight position={[8, 14, 7]} intensity={1.15} />
      <FrameAndFollow scene={scene} moved={moved} />
      <SceneBody scene={scene} onEnter={onEnter} />
      <Walker scene={scene} moved={moved} onEnter={onEnter} onNear={onNear} />
    </>
  );
}

export default function NeighborhoodWorld({
  sceneId,
  onScene,
}: {
  sceneId: string;
  onScene: (id: string) => void;
}) {
  const scene = scenes[sceneId] ?? scenes.commons;
  const [near, setNear] = useState<Portal | null>(null);

  useEffect(() => {
    setNear(null);
  }, [scene.id]);

  return (
    <div className="mlv-world" data-testid="mlv-neighborhood">
      <Canvas camera={{ position: scene.frame.position, fov: 48 }} style={{ width: '100%', height: '100vh' }}>
        <Stage key={scene.id} scene={scene} onEnter={onScene} onNear={setNear} />
      </Canvas>
      <aside className="mlv-world-hud" aria-label="Wayfinding">
        <h2 data-testid="world-scene-title">{scene.title}</h2>
        <p>{scene.blurb}</p>
        {near && <p className="mlv-world-hud__near">Press E — {near.label}</p>}
        <ul>
          {scene.portals.map((portal) => (
            <li key={portal.id}>
              <button type="button" data-testid={`portal-${portal.id}`} onClick={() => onScene(portal.to)}>
                {portal.label}
              </button>
            </li>
          ))}
        </ul>
        <p className="mlv-world-hud__hint">Walk with WASD. Doors in the world open the next room.</p>
      </aside>
    </div>
  );
}
