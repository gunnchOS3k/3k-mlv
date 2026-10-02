import { Suspense } from 'react';
import CampusArchitecture from './architecture/CampusArchitecture';
import { CAMPUS_SCENES } from './architecture/scenes';

/**
 * V4 CampusWorld — composes campus-specific architectural assemblies.
 * Rooms are represented via building→wing→program zoning + list mode,
 * not as visible Box-per-room placeholders.
 */
export default function CampusWorld({ slug, phaseId }: { slug: string; phaseId: string }) {
  if (!CAMPUS_SCENES[slug]) return null;

  return (
    <Suspense fallback={null}>
      <CampusArchitecture slug={slug} phaseId={phaseId} />
    </Suspense>
  );
}
