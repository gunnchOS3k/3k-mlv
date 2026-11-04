import { Suspense } from 'react';
import CampusArchitecture from './architecture/CampusArchitecture';
import { CAMPUS_SCENES } from './architecture/scenes';

/**
 * V4 CampusWorld — composes campus-specific architectural assemblies.
 * Rooms are represented via building→wing→program zoning + list mode,
 * not as visible Box-per-room placeholders. Focused program keys are
 * schematic highlights only — not surveyed fidelity or Pixel claims.
 */
export default function CampusWorld({
  slug,
  phaseId,
  focusedProgramKey = null,
}: {
  slug: string;
  phaseId: string;
  focusedProgramKey?: string | null;
}) {
  if (!CAMPUS_SCENES[slug]) return null;

  return (
    <Suspense fallback={null}>
      <CampusArchitecture slug={slug} phaseId={phaseId} focusedProgramKey={focusedProgramKey} />
    </Suspense>
  );
}
