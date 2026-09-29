import type { AuthoredProp } from './worldDefs';

/** WORLD-mode authored assemblies — not planning massing boxes. */
export default function WorldGeometry({ props }: { props: AuthoredProp[] }) {
  return (
    <group>
      {props.map((p) => (
        <mesh key={p.id} position={p.position} rotation={[0, p.rotationY || 0, 0]}>
          <boxGeometry args={p.size} />
          <meshStandardMaterial
            color={p.color}
            roughness={p.kind === 'window' ? 0.2 : 0.85}
            metalness={p.kind === 'window' ? 0.3 : 0.05}
            transparent={p.kind === 'window'}
            opacity={p.kind === 'window' ? 0.55 : 1}
          />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow={false}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#3f6212" />
      </mesh>
    </group>
  );
}
