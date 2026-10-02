export default function CharacterAvatar({ color = '#c4a484' }: { color?: string }) {
  return (
    <group>
      <mesh position={[0, 0.9, 0]} castShadow={false}>
        <capsuleGeometry args={[0.28, 0.9, 4, 8]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial color="#e7d2b8" />
      </mesh>
    </group>
  );
}
