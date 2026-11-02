import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { cameraLookAt, chaseCameraPosition } from './cameraRig.mjs';

type Props = {
  target: [number, number, number];
  yaw: number;
  pitch?: number;
  distance?: number;
  reducedMotion?: boolean;
};

export default function ThirdPersonCamera({ target, yaw, pitch = 0.35, distance = 5.2, reducedMotion }: Props) {
  const { camera } = useThree();
  const cur = useRef(new THREE.Vector3(...chaseCameraPosition(target, yaw, pitch, distance)));
  useFrame(() => {
    const desired = new THREE.Vector3(...chaseCameraPosition(target, yaw, pitch, distance));
    if (reducedMotion) cur.current.copy(desired);
    else cur.current.lerp(desired, 0.12);
    camera.position.copy(cur.current);
    camera.lookAt(...cameraLookAt(target));
  });
  return null;
}
