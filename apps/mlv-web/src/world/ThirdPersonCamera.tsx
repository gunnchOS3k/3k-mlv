import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { cameraLookAt, resolveChaseCamera } from './cameraRig.mjs';
import type { WorldCollision } from './types';

type Props = {
  target: [number, number, number];
  yaw: number;
  pitch?: number;
  distance?: number;
  collisions?: WorldCollision[];
  reducedMotion?: boolean;
};

export default function ThirdPersonCamera({ target, yaw, pitch = 0.35, distance = 5.2, collisions = [], reducedMotion }: Props) {
  const { camera } = useThree();
  const cur = useRef(new THREE.Vector3(...resolveChaseCamera(target, yaw, pitch, distance, collisions)));
  useFrame(() => {
    const desired = new THREE.Vector3(...resolveChaseCamera(target, yaw, pitch, distance, collisions));
    const pivot = new THREE.Vector3(...cameraLookAt(target));
    // Pull in instantly so the lens never lerps through a wall; ease only outward.
    if (reducedMotion || desired.distanceTo(pivot) < cur.current.distanceTo(pivot)) cur.current.copy(desired);
    else cur.current.lerp(desired, 0.12);
    camera.position.copy(cur.current);
    camera.lookAt(pivot);
  });
  return null;
}
