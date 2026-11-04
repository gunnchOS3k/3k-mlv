import { useMemo } from 'react';
import { Text } from '@react-three/drei';
import { renderModule, ProgramZoneMarker } from './modules';
import { CAMPUS_SCENES } from './scenes';
import { phaseAtLeast, resolvePhaseTier, type PhaseTier } from './types';

export default function CampusArchitecture({
  slug,
  phaseId,
  focusedProgramKey = null,
}: {
  slug: string;
  phaseId: string;
  /** Room key from specialty journey — highlights matching program zone (honest planning twin only). */
  focusedProgramKey?: string | null;
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

  const focusLabel = focusedProgramKey
    ? zones.find((z) => z.programKey === focusedProgramKey)?.name || focusedProgramKey
    : null;

  return (
    <group scale={massing.scale}>
      {modules.map((m) => renderModule(m))}
      {zones.map((z) => (
        <ProgramZoneMarker
          key={z.id}
          position={z.position}
          name={z.name}
          focused={Boolean(focusedProgramKey && z.programKey === focusedProgramKey)}
        />
      ))}
      <Text position={[0, 4.2, 0]} fontSize={0.32} color="white" anchorX="center" outlineWidth={0.02} outlineColor="#111">
        {scene.slug.replace('-', ' ').toUpperCase()} · {tierLabel(tier, slug)} · planning twin
      </Text>
      <Text position={[0, 3.75, 0]} fontSize={0.13} color="#fde68a" anchorX="center" maxWidth={11}>
        {scene.truthNote
          || 'Authored navigable planning twin · not surveyed architecture · not a built-campus claim'}
      </Text>
      <Text position={[0, 3.5, 0]} fontSize={0.1} color="#e2e8f0" anchorX="center" maxWidth={12}>
        Silhouette (schematic): {scene.silhouette}
      </Text>
      <Text position={[0, 3.28, 0]} fontSize={0.09} color="#cbd5e1" anchorX="center" maxWidth={12}>
        Site plan (authored): {scene.sitePlan}
      </Text>
      <Text position={[0, 3.08, 0]} fontSize={0.085} color="#fca5a5" anchorX="center" maxWidth={12}>
        PIXEL_7GC_CAMPUS_PASS=false · HUMAN_7GC_SPATIAL_FIDELITY_PASS=false · not surveyed
      </Text>
      {focusLabel && (
        <Text position={[0, 2.86, 0]} fontSize={0.12} color="#a7f3d0" anchorX="center" maxWidth={10}>
          Focused program: {focusLabel} (specialty room bind · schematic)
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
