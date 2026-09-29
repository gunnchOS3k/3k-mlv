import { Text } from '@react-three/drei';
import { Canopy, MassBlock, ModuleCylinder, TerrainPlate, Tower, TruthLabel, WaterEdge } from './primitives';

function phaseScale(phaseId: string, pilot: number, semi: number, full: number): number {
  const p = phaseId.toUpperCase();
  if (p.includes('PILOT') || p.includes('REMOTE') || p.includes('RECOVERY_NETWORK')) return pilot;
  if (p.includes('SEMI') || p.includes('TWIN')) return semi;
  return full;
}

export function GaryCampus({ phaseId }: { phaseId: string }) {
  const n = phaseScale(phaseId, 1, 2, 3);
  return (
    <group>
      <TerrainPlate color="#3a342c" />
      <MassBlock position={[-4, 1.4, 0]} scale={[10, 2.8, 3.2]} color="#8b5a3c" label="Civic-Industrial Hall" />
      <MassBlock position={[5, 2.2, -1]} scale={[4, 4.4, 3]} color="#b4532a" label="Project / Gallery" />
      {n >= 2 ? <MassBlock position={[-2, 1.1, 5]} scale={[5, 2.2, 3]} color="#6b4f3a" label="Repair + Network Labs" /> : null}
      {n >= 3 ? <MassBlock position={[4, 1.2, 5]} scale={[4.5, 2.4, 3]} color="#5c4030" label="Apprenticeship Studio" /> : null}
      <MassBlock position={[0, 0.15, 8]} scale={[8, 0.3, 4]} color="#4a5560" label="Arrival Plaza" />
      <Text position={[0, 4.8, 7]} fontSize={0.32} color="white" anchorX="center">
        Gary — adaptive-reuse civic flagship
      </Text>
    </group>
  );
}

export function GhanaCampus({ phaseId }: { phaseId: string }) {
  const n = phaseScale(phaseId, 3, 5, 7);
  const pavilions = Array.from({ length: n }, (_, i) => {
    const a = (i / Math.max(n, 1)) * Math.PI * 2;
    return (
      <group key={i} position={[Math.cos(a) * 5.5, 0, Math.sin(a) * 5.5]}>
        <MassBlock position={[0, 0.9, 0]} scale={[2.4, 1.8, 2.2]} color="#c9a227" label={i === 0 ? 'Learning Pavilion' : undefined} />
        <Canopy position={[0, 2.1, 0]} scale={[3.2, 0.1, 2.8]} color="#e8d48b" />
      </group>
    );
  });
  return (
    <group>
      <TerrainPlate color="#3d4a2f" />
      <MassBlock position={[0, 0.08, 0]} scale={[7, 0.16, 7]} color="#5a6b40" label="Shaded Courtyard" />
      {pavilions}
      <MassBlock position={[0, 1.0, 8]} scale={[4, 2, 2.5]} color="#a67c2a" label="Community Room" />
      <Text position={[0, 4.2, 0]} fontSize={0.28} color="white" anchorX="center">
        Ghana — shaded courtyard cluster
      </Text>
    </group>
  );
}

export function GuyanaCampus({ phaseId }: { phaseId: string }) {
  const n = phaseScale(phaseId, 1, 2, 3);
  return (
    <group>
      <TerrainPlate color="#24382f" scale={[24, 0.1, 16]} />
      <WaterEdge />
      <MassBlock position={[-6, 1.6, 0]} scale={[8, 1.6, 2.4]} color="#1d4e6f" label="Raised Learning Spine" />
      <MassBlock position={[2, 1.8, 0]} scale={[6, 1.6, 2.4]} color="#2563a8" />
      {n >= 2 ? <Tower position={[7, 2.8, -2]} scale={[1.6, 5.5, 1.6]} color="#0ea5e9" label="Climate + GIS" /> : null}
      {n >= 3 ? <MassBlock position={[0, 1.4, -5]} scale={[5, 2.4, 3]} color="#164e63" label="Energy / Logistics" /> : null}
      <MassBlock position={[-2, 0.9, 3]} scale={[3, 0.4, 1]} color="#94a3b8" label="Boardwalk" />
      <Text position={[0, 5.2, 6]} fontSize={0.28} color="white" anchorX="center">
        Guyana — river-aware resilience spine
      </Text>
    </group>
  );
}

export function GeelongCampus({ phaseId }: { phaseId: string }) {
  const n = phaseScale(phaseId, 1, 2, 3);
  return (
    <group>
      <TerrainPlate color="#3b342c" />
      <MassBlock position={[-5, 1.8, 0]} scale={[7, 3.2, 5]} color="#6b5b4b" label="Workshop Shed" />
      <MassBlock position={[4, 1.5, 1]} scale={[6, 2.6, 4.5]} color="#7a6a58" label="Maker Yard Hall" />
      <Canopy position={[0, 2.6, 6]} scale={[8, 0.12, 4]} color="#86efac" />
      {n >= 2 ? <MassBlock position={[-2, 1.2, -6]} scale={[4, 2.2, 3]} color="#57534e" label="Design Studio" /> : null}
      {n >= 3 ? <Tower position={[7, 2.4, -5]} scale={[1.4, 4.5, 1.4]} color="#a8a29e" label="Gantry Ref" /> : null}
      <Text position={[0, 4.6, 8]} fontSize={0.28} color="white" anchorX="center">
        Geelong — design/build workshop yard
      </Text>
    </group>
  );
}

export function GermanyCampus({ phaseId }: { phaseId: string }) {
  const n = phaseScale(phaseId, 4, 6, 8);
  const halls = Array.from({ length: n }, (_, i) => (
    <MassBlock
      key={i}
      position={[(i % 4) * 3.2 - 4.8, 1.3, Math.floor(i / 4) * 3.4 - 2]}
      scale={[2.8, 2.6, 2.8]}
      color="#4b5563"
      label={i === 0 ? 'Apprenticeship Hall' : undefined}
    />
  ));
  return (
    <group>
      <TerrainPlate color="#2f3338" />
      {halls}
      <Tower position={[8, 3, 0]} scale={[1.8, 6, 2.2]} color="#374151" label="Service Bay" />
      <MassBlock position={[0, 0.2, 7]} scale={[12, 0.3, 2]} color="#6b7280" label="Transit Edge" />
      <Text position={[0, 5.5, 8]} fontSize={0.28} color="white" anchorX="center">
        Germany — apprenticeship industrial grid
      </Text>
    </group>
  );
}

export function GazaCampus({ phaseId }: { phaseId: string }) {
  const n = phaseScale(phaseId, 4, 6, 8);
  const mods = Array.from({ length: n }, (_, i) => {
    const a = (i / Math.max(n, 1)) * Math.PI * 2;
    return (
      <ModuleCylinder
        key={i}
        position={[Math.cos(a) * 5, 0.7, Math.sin(a) * 5]}
        color="#d6c7a1"
        label={i === 0 ? 'Learning Module' : i === 1 ? 'Repair Bench' : undefined}
      />
    );
  });
  return (
    <group>
      <TerrainPlate color="#4a4336" />
      <MassBlock position={[0, 0.1, 0]} scale={[5, 0.2, 5]} color="#a8a29e" label="Temporary Learning Circle" />
      {mods}
      <Canopy position={[0, 2.4, 0]} scale={[4, 0.1, 4]} color="#fbbf24" />
      <TruthLabel position={[0, 4.2, 0]} text="TRUTH: Distributed recovery network — not a permanent campus claim" />
      <Text position={[0, 5.0, 7]} fontSize={0.24} color="white" anchorX="center">
        Gaza — recovery learning network
      </Text>
    </group>
  );
}

export function GrahamLandCampus({ phaseId }: { phaseId: string }) {
  const n = phaseScale(phaseId, 3, 5, 6);
  return (
    <group>
      <TerrainPlate color="#cbd5e1" scale={[24, 0.12, 18]} />
      <MassBlock position={[-4, 1.2, 0]} scale={[5, 2.2, 3]} color="#94a3b8" label="Climate Data Lab" />
      <MassBlock position={[3, 1.2, 1]} scale={[4.5, 2.2, 3]} color="#64748b" label="GIS / Remote Sensing" />
      {n >= 4 ? <Tower position={[7, 2.8, -3]} scale={[0.5, 5.5, 0.5]} color="#e2e8f0" label="Antenna" /> : null}
      {n >= 5 ? <ModuleCylinder position={[-7, 0.8, -4]} color="#94a3b8" label="Sensor Bench" /> : null}
      <TruthLabel position={[0, 4.5, 0]} text="TRUTH: Remote polar education twin — simulation / partner reference only" />
      <Text position={[0, 5.4, 7]} fontSize={0.24} color="white" anchorX="center">
        Graham Land — remote polar ops twin
      </Text>
    </group>
  );
}

export function CampusBySlug({ slug, phaseId }: { slug: string; phaseId: string }) {
  switch (slug) {
    case 'gary':
      return <GaryCampus phaseId={phaseId} />;
    case 'ghana':
      return <GhanaCampus phaseId={phaseId} />;
    case 'guyana':
      return <GuyanaCampus phaseId={phaseId} />;
    case 'geelong':
      return <GeelongCampus phaseId={phaseId} />;
    case 'germany':
      return <GermanyCampus phaseId={phaseId} />;
    case 'gaza':
      return <GazaCampus phaseId={phaseId} />;
    case 'graham-land':
      return <GrahamLandCampus phaseId={phaseId} />;
    default:
      return null;
  }
}
