import type { AuthoredProp } from './worldDefs';

function GalleryWingPiece({ prop }: { prop: AuthoredProp }) {
  const [w, h, d] = prop.size;
  if (prop.id === 'frame_local') {
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[w * 1.15, h * 1.05, 0.16]} />
          <meshStandardMaterial color="#92400e" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.1]}>
          <boxGeometry args={[w * 0.72, h * 0.62, 0.05]} />
          <meshStandardMaterial color="#f5e6c8" roughness={0.6} />
        </mesh>
      </group>
    );
  }
  if (prop.id === 'frame_museum') {
    return (
      <group>
        <mesh position={[0, h * 0.15, 0]}>
          <boxGeometry args={[w, h, 0.14]} />
          <meshStandardMaterial color="#e7e5e4" roughness={0.7} />
        </mesh>
        <mesh position={[0, h * 0.55, 0]}>
          <boxGeometry args={[w * 0.7, h * 0.18, 0.08]} />
          <meshStandardMaterial color="#93c5fd" roughness={0.25} metalness={0.2} />
        </mesh>
      </group>
    );
  }
  if (prop.id === 'frame_exchange') {
    return (
      <group>
        <mesh position={[0, -h * 0.2, 0]}>
          <boxGeometry args={[w, 0.12, d]} />
          <meshStandardMaterial color="#334155" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[w * 0.92, 0.08, d * 0.8]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.3} />
        </mesh>
      </group>
    );
  }
  if (prop.id === 'frame_public') {
    return (
      <group>
        <mesh>
          <boxGeometry args={[w, h, 0.08]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.9} />
        </mesh>
        {[-0.3, 0, 0.3].map((t) => (
          <mesh key={t} position={[t * w, 0, 0.06]}>
            <boxGeometry args={[0.28, 0.36, 0.03]} />
            <meshStandardMaterial color="#b45309" />
          </mesh>
        ))}
      </group>
    );
  }
  if (prop.id === 'frame_mine') {
    return (
      <group>
        <mesh>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.65} />
        </mesh>
        <mesh position={[w * 0.28, 0, d * 0.52]}>
          <boxGeometry args={[0.08, 0.08, 0.04]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
      </group>
    );
  }
  return null;
}

/** WORLD-mode authored assemblies — campus massing is supplied separately. */
export default function WorldGeometry({ props }: { props: AuthoredProp[] }) {
  return (
    <group>
      {props.map((p) => {
        const galleryPiece = p.id.startsWith('frame_') ? <GalleryWingPiece prop={p} /> : null;
        if (galleryPiece) {
          return (
            <group key={p.id} position={p.position} rotation={[0, p.rotationY || 0, 0]}>
              {galleryPiece}
            </group>
          );
        }
        if (p.shape === 'cylinder') {
          return (
            <mesh key={p.id} position={p.position} rotation={[0, p.rotationY || 0, 0]}>
              <cylinderGeometry args={[p.size[0] / 2, p.size[2] / 2, p.size[1], 12]} />
              <meshStandardMaterial
                color={p.color}
                roughness={p.roughness ?? 0.85}
                metalness={p.metalness ?? 0.05}
                emissive={p.emissive || '#000000'}
                emissiveIntensity={p.emissive ? 0.15 : 0}
              />
            </mesh>
          );
        }
        return (
          <mesh key={p.id} position={p.position} rotation={[0, p.rotationY || 0, 0]}>
            <boxGeometry args={p.size} />
            <meshStandardMaterial
              color={p.color}
              roughness={p.roughness ?? (p.kind === 'window' ? 0.2 : 0.85)}
              metalness={p.metalness ?? (p.kind === 'window' ? 0.3 : 0.05)}
              emissive={p.emissive || '#000000'}
              emissiveIntensity={p.emissive ? 0.15 : 0}
              transparent={p.kind === 'window' || typeof p.opacity === 'number'}
              opacity={p.opacity ?? (p.kind === 'window' ? 0.55 : 1)}
            />
          </mesh>
        );
      })}
    </group>
  );
}
