import { useMemo } from 'react';
import { Text } from '@react-three/drei';
import { renderModule, ProgramZoneMarker } from './modules';
import { CAMPUS_SCENES } from './scenes';
import { phaseAtLeast, resolvePhaseTier, type PhaseTier } from './types';

export default function CampusArchitecture({
  slug,
  phaseId,
}: {
  slug: string;
  phaseId: string;
}) {
  const scene = CAMPUS_SCENES[slug];
  const tier = useMemo(() => resolvePhaseTier(slug, phaseId), [slug, phaseId]);

  if (!scene) return null;

  const massing = scene.phaseMassing[tier];
  const modules = useMemo(() => {
    const base = scene.modules.filter((m) => phaseAtLeast(tier, m.fromPhase));
    const extras = (massing.extraModules || []).filter((m) => phaseAtLeast(tier, m.fromPhase));
    return [...base, ...extras];
  }, [scene, tier, massing]);

  const zones = useMemo(
    () => scene.programZones.filter((z) => phaseAtLeast(tier, z.fromPhase)),
    [scene, tier],
  );

  return (
    <group scale={massing.scale}>
      {modules.map((m) => renderModule(m))}
      {zones.map((z) => (
        <ProgramZoneMarker key={z.id} position={z.position} name={z.name} />
      ))}
      <Text position={[0, 4.2, 0]} fontSize={0.32} color="white" anchorX="center" outlineWidth={0.02} outlineColor="#111">
        {scene.slug.replace('-', ' ').toUpperCase()} · {tierLabel(tier, slug)}
      </Text>
      {scene.truthNote && (
        <Text position={[0, 3.6, 0]} fontSize={0.14} color="#fecaca" anchorX="center" maxWidth={10}>
          {scene.truthNote}
        </Text>
      )}
    </group>
  );
}

function tierLabel(tier: PhaseTier, slug: string): string {
  if (slug === 'gaza') {
    if (tier === 'pilot') return 'RECOVERY NETWORK';
    if (tier === 'semi') return 'SEMI HUB';
    return 'RECOVERY HUB';
  }
  if (slug === 'graham-land') {
    if (tier === 'pilot') return 'REMOTE LAB';
    if (tier === 'semi') return 'TWIN STUDIO';
    return 'POLAR ED HUB';
  }
  if (tier === 'pilot') return 'PILOT';
  if (tier === 'semi') return 'SEMI';
  return 'FULL';
}
