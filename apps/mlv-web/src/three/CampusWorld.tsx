import { Suspense, useMemo } from 'react';
import { Box, Text } from '@react-three/drei';
import { campusBySlug, roomsAvailableAtPhase } from '@3k-mlv/campus';

const LAYOUT_COLOR: Record<string, string> = {
  CIVIC_HALL_AND_PROJECT_CORRIDOR: '#b4532a',
  COURTYARD_LEARNING_CLUSTER: '#c9a227',
  RIVER_AWARE_LINEAR_CAMPUS: '#1d4e6f',
  WORKSHOP_YARD_INDUSTRIAL_WELCOMING: '#6b5b4b',
  PRECISE_GRID_APPRENTICESHIP_HALLS: '#4b5563',
  TEMPORARY_LEARNING_CIRCLES: '#d6c7a1',
  REMOTE_LAB_PLUS_SIMULATION_LAYERS: '#94a3b8',
};

function positionFor(layout: string, index: number, total: number): [number, number, number] {
  if (layout === 'COURTYARD_LEARNING_CLUSTER' || layout === 'TEMPORARY_LEARNING_CIRCLES') {
    const angle = (index / Math.max(total, 1)) * Math.PI * 2;
    return [Math.cos(angle) * 6, 0.4, Math.sin(angle) * 6];
  }
  if (layout === 'RIVER_AWARE_LINEAR_CAMPUS') {
    return [index * 2.2 - 7, 0.4, Math.sin(index) * 1.4];
  }
  if (layout === 'PRECISE_GRID_APPRENTICESHIP_HALLS') {
    return [(index % 4) * 2.4 - 3.6, 0.4, Math.floor(index / 4) * 2.4 - 2.4];
  }
  if (layout === 'WORKSHOP_YARD_INDUSTRIAL_WELCOMING') {
    return [(index % 3) * 3 - 3, 0.4, Math.floor(index / 3) * 2.8];
  }
  if (layout === 'REMOTE_LAB_PLUS_SIMULATION_LAYERS') {
    return [index * 1.8 - 6, 0.4, -index * 0.35];
  }
  return [index * 2.1 - 6, 0.4, -4];
}

export default function CampusWorld({ slug, phaseId }: { slug: string; phaseId: string }) {
  const campus = campusBySlug(slug);
  const rooms = useMemo(
    () => (campus ? roomsAvailableAtPhase(campus, phaseId).slice(0, 12) : []),
    [campus, phaseId],
  );
  if (!campus) return null;
  const color = LAYOUT_COLOR[campus.layout] || '#888';

  return (
    <Suspense fallback={null}>
      <Box args={[18, 0.08, 14]} position={[0, -0.04, 0]}>
        <meshStandardMaterial color="#2f3d2f" />
      </Box>
      <Box args={[3.2, 1.6, 2.4]} position={[0, 0.8, 7]}>
        <meshStandardMaterial color={color} />
      </Box>
      <Text position={[0, 2.1, 7]} fontSize={0.28} color="white" anchorX="center">
        {campus.atlas_name}
      </Text>
      {rooms.map((room, index) => {
        const pos = positionFor(campus.layout, index, rooms.length);
        return (
          <group key={room.key} position={pos}>
            <Box args={[1.3, 0.8, 1.1]}>
              <meshStandardMaterial color={color} />
            </Box>
            <Text position={[0, 0.7, 0]} fontSize={0.12} color="white" anchorX="center">
              {room.name}
            </Text>
          </group>
        );
      })}
    </Suspense>
  );
}
