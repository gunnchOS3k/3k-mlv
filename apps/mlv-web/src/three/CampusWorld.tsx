import { Suspense, useMemo } from 'react';
import { Text } from '@react-three/drei';
import { campusBySlug, roomsAvailableAtPhase } from '@3k-mlv/campus';
import { CampusBySlug } from './architecture/campusScenes';

/**
 * V4 architectural fidelity layer.
 * Replaces visible room-box placeholders with campus-specific massing.
 * Room/program selection remains available via list/direct nav (non-spatial).
 */
export default function CampusWorld({ slug, phaseId }: { slug: string; phaseId: string }) {
  const campus = campusBySlug(slug);
  const rooms = useMemo(
    () => (campus ? roomsAvailableAtPhase(campus, phaseId).slice(0, 8) : []),
    [campus, phaseId],
  );
  if (!campus) return null;

  return (
    <Suspense fallback={null}>
      <CampusBySlug slug={slug} phaseId={phaseId} />
      {/* Program overlay — labels only, not room-box buildings */}
      <group position={[0, 0.2, -9]}>
        <Text position={[0, 2.8, 0]} fontSize={0.22} color="#e2e8f0" anchorX="center">
          Programs (list/direct nav remains authoritative)
        </Text>
        {rooms.map((room, index) => (
          <Text
            key={room.key}
            position={[(index % 4) * 3.2 - 4.8, 2.2 - Math.floor(index / 4) * 0.45, 0]}
            fontSize={0.14}
            color="#cbd5e1"
            anchorX="center"
          >
            {room.name}
          </Text>
        ))}
      </group>
    </Suspense>
  );
}
