import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import CharacterAvatar from './CharacterAvatar';
import { resolveXZ, type AABB } from './CollisionWorld';
import { readGamepad } from './GamepadControls';

type Props = {
  position: [number, number, number];
  facing: number;
  onChange: (pos: [number, number, number], facing: number) => void;
  collisions: AABB[];
  moveInput: { x: number; y: number };
  lookInput: { x: number; y: number };
  seated?: boolean;
};

export default function AvatarController({ position, facing, onChange, collisions, moveInput, lookInput, seated }: Props) {
  const keys = useRef<Record<string, boolean>>({});
  useEffect(() => {
    const down = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = true; };
    const up = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  useFrame((_, dt) => {
    if (seated) return;
    const pad = readGamepad();
    let mx = moveInput.x + (pad?.moveX || 0);
    let my = moveInput.y + (pad?.moveY || 0);
    if (keys.current['w'] || keys.current['arrowup']) my -= 1;
    if (keys.current['s'] || keys.current['arrowdown']) my += 1;
    if (keys.current['a'] || keys.current['arrowleft']) mx -= 1;
    if (keys.current['d'] || keys.current['arrowright']) mx += 1;
    let yaw = facing + (lookInput.x + (pad?.lookX || 0)) * dt * 1.8;
    const speed = 3.2;
    const forward = -my;
    const strafe = mx;
    const dx = (Math.sin(yaw) * forward + Math.cos(yaw) * strafe) * speed * dt;
    const dz = (Math.cos(yaw) * forward - Math.sin(yaw) * strafe) * speed * dt;
    const next = resolveXZ([position[0] + dx, position[1], position[2] + dz], collisions);
    if (dx !== 0 || dz !== 0 || yaw !== facing) onChange(next, yaw);
  });

  return (
    <group position={position} rotation={[0, facing, 0]}>
      <CharacterAvatar />
    </group>
  );
}
