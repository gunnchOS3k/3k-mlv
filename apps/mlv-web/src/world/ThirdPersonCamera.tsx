import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

type Props = {
  target: [number, number, number];
  yaw: number;
  pitch?: number;
  distance?: number;
  reducedMotion?: boolean;
};

export default function ThirdPersonCamera({ target, yaw, pitch = 0.35, distance = 5.2, reducedMotion }: Props) {
  const { camera } = useThree();
  const cur = useRef(new THREE.Vector3(target[0], target[1] + 1.6, target[2] + distance));
  useFrame(() => {
    const desired = new THREE.Vector3(
      target[0] + Math.sin(yaw) * distance,
      target[1] + 1.6 + Math.sin(pitch) * 1.2,
      target[2] + Math.cos(yaw) * distance,
    );
    if (reducedMotion) cur.current.copy(desired);
    else cur.current.lerp(desired, 0.12);
    camera.position.copy(cur.current);
    camera.lookAt(target[0], target[1] + 1.2, target[2]);
  });
  return null;
}
