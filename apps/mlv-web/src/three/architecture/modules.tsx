import { Text } from '@react-three/drei';
import type { ModulePlacement, Vec3 } from './types';

const MAT = {
  steel: '#6b7280',
  masonry: '#8b6f5c',
  warmBrick: '#a16207',
  shade: '#d6d3d1',
  timber: '#92400e',
  water: '#0e7490',
  landscape: '#3f6212',
  plaza: '#a8a29e',
  canopy: '#fbbf24',
  glass: '#93c5fd',
  polar: '#e2e8f0',
  module: '#d6c7a1',
  asphalt: '#44403c',
  rail: '#57534e',
};

function BoxMesh({
  args,
  position,
  color,
  rotationY = 0,
}: {
  args: Vec3;
  position?: Vec3;
  color: string;
  rotationY?: number;
}) {
  return (
    <mesh position={position || [0, 0, 0]} rotation={[0, rotationY, 0]} castShadow={false} receiveShadow={false}>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} roughness={0.85} metalness={0.05} />
    </mesh>
  );
}

/** Flat site plate — not a room placeholder. */
export function TerrainPlate({ size, color }: { size: Vec3; color: string }) {
  return (
    <mesh position={[0, -0.02, 0]} receiveShadow={false}>
      <boxGeometry args={[size[0], 0.06, size[2]]} />
      <meshStandardMaterial color={color} roughness={1} />
    </mesh>
  );
}

export function StreetEdge({ position, size, rotationY = 0 }: { position: Vec3; size: Vec3; rotationY?: number }) {
  return <BoxMesh args={[size[0], 0.08, size[2]]} position={[position[0], 0.04, position[2]]} color={MAT.asphalt} rotationY={rotationY} />;
}

export function TransitEdge({ position, size }: { position: Vec3; size: Vec3 }) {
  return (
    <group position={position}>
      <BoxMesh args={[size[0], 0.06, size[2]]} position={[0, 0.03, 0]} color={MAT.rail} />
      <BoxMesh args={[size[0] * 0.9, 0.12, 0.08]} position={[0, 0.12, -size[2] * 0.2]} color="#78716c" />
      <BoxMesh args={[size[0] * 0.9, 0.12, 0.08]} position={[0, 0.12, size[2] * 0.2]} color="#78716c" />
    </group>
  );
}

export function WaterEdge({ position, size }: { position: Vec3; size: Vec3 }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[size[0], size[2]]} />
        <meshStandardMaterial color={MAT.water} roughness={0.35} metalness={0.2} transparent opacity={0.85} />
      </mesh>
      <BoxMesh args={[size[0], 0.15, 0.35]} position={[0, 0.1, size[2] * 0.45]} color="#78716c" />
    </group>
  );
}

export function LandscapeZone({ position, size, color }: { position: Vec3; size: Vec3; color?: string }) {
  return <BoxMesh args={[size[0], 0.12, size[2]]} position={[position[0], 0.06, position[2]]} color={color || MAT.landscape} />;
}

export function PublicPlaza({ position, size }: { position: Vec3; size: Vec3 }) {
  return (
    <group position={position}>
      <BoxMesh args={[size[0], 0.1, size[2]]} position={[0, 0.05, 0]} color={MAT.plaza} />
      <BoxMesh args={[0.35, 0.9, 0.35]} position={[-size[0] * 0.35, 0.45, -size[2] * 0.3]} color="#57534e" />
    </group>
  );
}

export function Courtyard({ position, size, color }: { position: Vec3; size: Vec3; color?: string }) {
  return (
    <group position={position}>
      <BoxMesh args={[size[0], 0.08, size[2]]} position={[0, 0.04, 0]} color={color || '#a3e635'} />
      <BoxMesh args={[size[0] * 0.35, 0.35, size[2] * 0.35]} position={[0, 0.2, 0]} color="#65a30d" />
    </group>
  );
}

export function CoveredWalk({ position, size, rotationY = 0 }: { position: Vec3; size: Vec3; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <BoxMesh args={[size[0], 0.08, size[2]]} position={[0, size[1], 0]} color={MAT.shade} />
      <BoxMesh args={[0.12, size[1], 0.12]} position={[-size[0] * 0.45, size[1] * 0.5, -size[2] * 0.4]} color="#78716c" />
      <BoxMesh args={[0.12, size[1], 0.12]} position={[size[0] * 0.45, size[1] * 0.5, -size[2] * 0.4]} color="#78716c" />
      <BoxMesh args={[0.12, size[1], 0.12]} position={[-size[0] * 0.45, size[1] * 0.5, size[2] * 0.4]} color="#78716c" />
      <BoxMesh args={[0.12, size[1], 0.12]} position={[size[0] * 0.45, size[1] * 0.5, size[2] * 0.4]} color="#78716c" />
    </group>
  );
}

export function Arcade({ position, size }: { position: Vec3; size: Vec3 }) {
  return (
    <group position={position}>
      <BoxMesh args={[size[0], size[1] * 0.2, size[2]]} position={[0, size[1] * 0.9, 0]} color={MAT.masonry} />
      {[-0.4, -0.15, 0.15, 0.4].map((t, i) => (
        <BoxMesh key={i} args={[0.18, size[1] * 0.8, 0.18]} position={[t * size[0], size[1] * 0.4, 0]} color={MAT.masonry} />
      ))}
    </group>
  );
}

export function RaisedWalkway({ position, size, rotationY = 0 }: { position: Vec3; size: Vec3; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <BoxMesh args={[size[0], 0.12, size[2]]} position={[0, size[1], 0]} color="#a8a29e" />
      <BoxMesh args={[0.15, size[1], 0.15]} position={[-size[0] * 0.4, size[1] * 0.5, 0]} color="#78716c" />
      <BoxMesh args={[0.15, size[1], 0.15]} position={[size[0] * 0.4, size[1] * 0.5, 0]} color="#78716c" />
    </group>
  );
}

/** Long-span shed with optional sawtooth roof language. */
export function WorkshopShed({
  position,
  size,
  color,
  sawtooth = true,
}: {
  position: Vec3;
  size: Vec3;
  color?: string;
  sawtooth?: boolean;
}) {
  const c = color || MAT.steel;
  return (
    <group position={position}>
      <BoxMesh args={[size[0], size[1] * 0.7, size[2]]} position={[0, size[1] * 0.35, 0]} color={c} />
      {sawtooth
        ? [-0.3, 0, 0.3].map((t, i) => (
            <mesh key={i} position={[t * size[0], size[1] * 0.85, 0]} rotation={[0, 0, 0.35]}>
              <boxGeometry args={[size[0] * 0.28, 0.18, size[2] * 0.95]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.7} />
            </mesh>
          ))
        : (
          <BoxMesh args={[size[0] * 1.02, 0.2, size[2] * 1.02]} position={[0, size[1] * 0.72, 0]} color="#64748b" />
        )}
    </group>
  );
}

export function LearningHall({ position, size, color }: { position: Vec3; size: Vec3; color?: string }) {
  return (
    <group position={position}>
      <BoxMesh args={size} position={[0, size[1] * 0.5, 0]} color={color || MAT.warmBrick} />
      <BoxMesh args={[size[0] * 1.05, 0.18, size[2] * 1.05]} position={[0, size[1] + 0.05, 0]} color="#57534e" />
    </group>
  );
}

export function LabBlock({ position, size, color, accent }: { position: Vec3; size: Vec3; color?: string; accent?: string }) {
  return (
    <group position={position}>
      <BoxMesh args={size} position={[0, size[1] * 0.5, 0]} color={color || MAT.steel} />
      <BoxMesh args={[size[0] * 0.7, size[1] * 0.45, 0.08]} position={[0, size[1] * 0.55, size[2] * 0.51]} color={accent || MAT.glass} />
    </group>
  );
}

export function CommunityHall({ position, size, color }: { position: Vec3; size: Vec3; color?: string }) {
  return (
    <group position={position}>
      <BoxMesh args={size} position={[0, size[1] * 0.5, 0]} color={color || '#b45309'} />
      <BoxMesh args={[size[0] * 0.4, size[1] * 0.35, size[2] * 0.2]} position={[0, size[1] * 1.05, 0]} color="#92400e" />
    </group>
  );
}

export function GalleryHall({ position, size, color }: { position: Vec3; size: Vec3; color?: string }) {
  return (
    <group position={position}>
      <BoxMesh args={size} position={[0, size[1] * 0.5, 0]} color={color || '#78716c'} />
      <BoxMesh args={[size[0] * 0.85, size[1] * 0.55, 0.06]} position={[0, size[1] * 0.55, size[2] * 0.52]} color={MAT.glass} />
    </group>
  );
}

export function RepairBay({ position, size }: { position: Vec3; size: Vec3 }) {
  return (
    <group position={position}>
      <BoxMesh args={size} position={[0, size[1] * 0.5, 0]} color="#57534e" />
      <BoxMesh args={[size[0] * 0.9, size[1] * 0.65, 0.05]} position={[0, size[1] * 0.45, size[2] * 0.52]} color="#38bdf8" />
      <BoxMesh args={[0.2, 0.15, size[2] * 0.4]} position={[0, 0.15, size[2] * 0.7]} color="#f59e0b" />
    </group>
  );
}

export function SolarCanopy({ position, size }: { position: Vec3; size: Vec3 }) {
  return (
    <group position={position}>
      <BoxMesh args={[size[0], 0.08, size[2]]} position={[0, size[1], 0]} color={MAT.canopy} />
      <BoxMesh args={[0.12, size[1], 0.12]} position={[-size[0] * 0.4, size[1] * 0.5, -size[2] * 0.35]} color="#78716c" />
      <BoxMesh args={[0.12, size[1], 0.12]} position={[size[0] * 0.4, size[1] * 0.5, size[2] * 0.35]} color="#78716c" />
      {[-0.25, 0, 0.25].map((t, i) => (
        <BoxMesh key={i} args={[size[0] * 0.28, 0.04, size[2] * 0.7]} position={[t * size[0], size[1] + 0.06, 0]} color="#1e3a8a" />
      ))}
    </group>
  );
}

export function MediaStudio({ position, size }: { position: Vec3; size: Vec3 }) {
  return (
    <group position={position}>
      <BoxMesh args={size} position={[0, size[1] * 0.5, 0]} color="#334155" />
      <BoxMesh args={[0.4, 0.4, 0.4]} position={[0, size[1] + 0.25, 0]} color="#ef4444" />
    </group>
  );
}

export function OperationsRoom({ position, size }: { position: Vec3; size: Vec3 }) {
  return (
    <group position={position}>
      <BoxMesh args={size} position={[0, size[1] * 0.5, 0]} color="#1e293b" />
      <BoxMesh args={[size[0] * 0.8, size[1] * 0.4, 0.06]} position={[0, size[1] * 0.55, size[2] * 0.52]} color="#22d3ee" />
    </group>
  );
}

export function TemporaryLearningModule({ position, size, color }: { position: Vec3; size: Vec3; color?: string }) {
  return (
    <group position={position}>
      <BoxMesh args={size} position={[0, size[1] * 0.5, 0]} color={color || MAT.module} />
      <BoxMesh args={[size[0] * 1.05, 0.08, size[2] * 1.05]} position={[0, size[1] + 0.02, 0]} color="#a8a29e" />
      <BoxMesh args={[0.08, 0.2, 0.08]} position={[-size[0] * 0.4, 0.1, -size[2] * 0.4]} color="#78716c" />
      <BoxMesh args={[0.08, 0.2, 0.08]} position={[size[0] * 0.4, 0.1, size[2] * 0.4]} color="#78716c" />
    </group>
  );
}

export function PolarResearchModule({ position, size }: { position: Vec3; size: Vec3 }) {
  return (
    <group position={position}>
      <BoxMesh args={size} position={[0, size[1] * 0.5, 0]} color={MAT.polar} />
      <BoxMesh args={[size[0] * 1.1, 0.15, size[2] * 1.1]} position={[0, size[1] + 0.05, 0]} color="#cbd5e1" />
      <BoxMesh args={[0.2, size[1] * 0.6, 0.2]} position={[size[0] * 0.55, size[1] * 0.4, 0]} color="#64748b" />
    </group>
  );
}

export function AntennaMast({ position, size }: { position: Vec3; size: Vec3 }) {
  return (
    <group position={position}>
      <BoxMesh args={[0.12, size[1], 0.12]} position={[0, size[1] * 0.5, 0]} color="#94a3b8" />
      <mesh position={[0, size[1], 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[size[0] * 0.4, size[0] * 0.4, 0.06, 12]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
    </group>
  );
}

export function PortGantry({ position, size }: { position: Vec3; size: Vec3 }) {
  return (
    <group position={position}>
      <BoxMesh args={[0.2, size[1], 0.2]} position={[-size[0] * 0.45, size[1] * 0.5, 0]} color="#475569" />
      <BoxMesh args={[0.2, size[1], 0.2]} position={[size[0] * 0.45, size[1] * 0.5, 0]} color="#475569" />
      <BoxMesh args={[size[0], 0.2, 0.2]} position={[0, size[1], 0]} color="#64748b" />
      <BoxMesh args={[0.15, 0.8, 0.15]} position={[0, size[1] - 0.5, 0]} color="#f59e0b" />
    </group>
  );
}

export function BridgeSpan({ position, size, rotationY = 0 }: { position: Vec3; size: Vec3; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <BoxMesh args={[size[0], 0.15, size[2]]} position={[0, size[1], 0]} color="#a8a29e" />
      <BoxMesh args={[0.12, size[1], 0.12]} position={[-size[0] * 0.45, size[1] * 0.5, 0]} color="#78716c" />
      <BoxMesh args={[0.12, size[1], 0.12]} position={[size[0] * 0.45, size[1] * 0.5, 0]} color="#78716c" />
    </group>
  );
}

export function WayfindingMarker({ position, label }: { position: Vec3; label?: string }) {
  return (
    <group position={position}>
      <BoxMesh args={[0.12, 1.4, 0.12]} position={[0, 0.7, 0]} color="#44403c" />
      <BoxMesh args={[0.7, 0.35, 0.08]} position={[0.25, 1.2, 0]} color="#fef3c7" />
      {label && (
        <Text position={[0.25, 1.2, 0.06]} fontSize={0.12} color="#1c1917" anchorX="center" maxWidth={0.6}>
          {label}
        </Text>
      )}
    </group>
  );
}

export function TruthLabel({ position, label }: { position: Vec3; label: string }) {
  return (
    <group position={position}>
      <BoxMesh args={[Math.max(3.2, label.length * 0.12), 0.55, 0.08]} position={[0, 0.3, 0]} color="#7f1d1d" />
      <Text position={[0, 0.3, 0.06]} fontSize={0.16} color="#fef2f2" anchorX="center" maxWidth={4.5}>
        {label}
      </Text>
    </group>
  );
}

/**
 * Program zone marker — architectural zoning (building→wing→program), NOT a detached room cube.
 * Rendered as a low inset floor plate + tiny door marker inside a parent hall.
 */
export function ProgramZoneMarker({ position, name }: { position: Vec3; name: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.1, 0.9]} />
        <meshStandardMaterial color="#fef9c3" transparent opacity={0.55} />
      </mesh>
      <BoxMesh args={[0.25, 0.55, 0.08]} position={[0, 0.28, 0.4]} color="#78350f" />
      <Text position={[0, 0.7, 0]} fontSize={0.1} color="white" anchorX="center" maxWidth={1.4}>
        {name}
      </Text>
    </group>
  );
}

export function renderModule(m: ModulePlacement) {
  const common = { position: m.position, size: m.size, color: m.color, rotationY: m.rotationY };
  switch (m.kind) {
    case 'terrain':
      return <TerrainPlate key={m.id} size={m.size} color={m.color || '#3f6212'} />;
    case 'street':
      return <StreetEdge key={m.id} {...common} />;
    case 'transit':
      return <TransitEdge key={m.id} position={m.position} size={m.size} />;
    case 'water':
      return <WaterEdge key={m.id} position={m.position} size={m.size} />;
    case 'landscape':
      return <LandscapeZone key={m.id} position={m.position} size={m.size} color={m.color} />;
    case 'plaza':
      return <PublicPlaza key={m.id} position={m.position} size={m.size} />;
    case 'courtyard':
      return <Courtyard key={m.id} position={m.position} size={m.size} color={m.color} />;
    case 'covered_walk':
      return <CoveredWalk key={m.id} {...common} />;
    case 'arcade':
      return <Arcade key={m.id} position={m.position} size={m.size} />;
    case 'raised_walk':
      return <RaisedWalkway key={m.id} {...common} />;
    case 'workshop_shed':
      return <WorkshopShed key={m.id} position={m.position} size={m.size} color={m.color} />;
    case 'learning_hall':
      return <LearningHall key={m.id} position={m.position} size={m.size} color={m.color} />;
    case 'lab_block':
      return <LabBlock key={m.id} position={m.position} size={m.size} color={m.color} accent={m.accent} />;
    case 'community_hall':
      return <CommunityHall key={m.id} position={m.position} size={m.size} color={m.color} />;
    case 'gallery_hall':
      return <GalleryHall key={m.id} position={m.position} size={m.size} color={m.color} />;
    case 'repair_bay':
      return <RepairBay key={m.id} position={m.position} size={m.size} />;
    case 'solar_canopy':
      return <SolarCanopy key={m.id} position={m.position} size={m.size} />;
    case 'media_studio':
      return <MediaStudio key={m.id} position={m.position} size={m.size} />;
    case 'operations':
      return <OperationsRoom key={m.id} position={m.position} size={m.size} />;
    case 'temporary_module':
      return <TemporaryLearningModule key={m.id} position={m.position} size={m.size} color={m.color} />;
    case 'polar_module':
      return <PolarResearchModule key={m.id} position={m.position} size={m.size} />;
    case 'antenna':
      return <AntennaMast key={m.id} position={m.position} size={m.size} />;
    case 'gantry':
      return <PortGantry key={m.id} position={m.position} size={m.size} />;
    case 'bridge':
      return <BridgeSpan key={m.id} {...common} />;
    case 'wayfinding':
      return <WayfindingMarker key={m.id} position={m.position} label={m.label} />;
    case 'truth_label':
      return <TruthLabel key={m.id} position={m.position} label={m.label || 'TRUTH'} />;
    default:
      return null;
  }
}
