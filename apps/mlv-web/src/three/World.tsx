import { lazy, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import type { MlvNode, MlvWorldPlacement } from '@3k-mlv/shared';

const CampusWorld = lazy(() => import('./CampusWorld'));

const PRESENTATION_COLOR: Record<string, string> = {
  frame: '#f6c445',
  book: '#8b4513',
  record: '#c0392b',
  screen: '#2c3e50',
  terminal: '#1abc9c',
  arcade: '#9b59b6',
  pedestal: '#7f8c8d',
  notebook: '#27ae60',
  lab_console: '#2980b9',
  parcel: '#d35400',
};

function Home({ theme }: { theme: string }) {
  const color = theme === 'cozy' ? '#c9a27e' : '#8899aa';
  return (
    <group>
      <Box args={[4.2, 2.4, 3.2]} position={[0, 1.2, -4]}>
        <meshStandardMaterial color={color} />
      </Box>
      <Box args={[4.6, 0.25, 3.6]} position={[0, 2.5, -4]}>
        <meshStandardMaterial color="#6b4226" />
      </Box>
      <Text position={[0, 3.1, -4]} fontSize={0.28} color="white" anchorX="center">
        Home
      </Text>
    </group>
  );
}

function Desk() {
  return (
    <Box args={[3.2, 0.18, 1.2]} position={[0, 0.7, 0]}>
      <meshStandardMaterial color="#7a4e2d" />
    </Box>
  );
}

function WorldObject({
  placement,
  node,
  onOpen,
}: {
  placement: MlvWorldPlacement;
  node: MlvNode;
  onOpen: (node: MlvNode) => void;
}) {
  const color = PRESENTATION_COLOR[placement.presentation_type] || PRESENTATION_COLOR.parcel;
  return (
    <group
      position={[placement.position.x, placement.position.y, placement.position.z]}
      onClick={(event: { stopPropagation: () => void }) => {
        event.stopPropagation();
        onOpen(node);
      }}
    >
      <Box args={[0.55, 0.55, 0.55]}>
        <meshStandardMaterial color={color} />
      </Box>
      <Text position={[0, 0.55, 0]} fontSize={0.12} color="white" anchorX="center">
        {node.name}
      </Text>
    </group>
  );
}

function Ground() {
  return (
    <Box args={[24, 0.1, 24]} position={[0, -0.05, 0]}>
      <meshStandardMaterial color="#4a7c59" />
    </Box>
  );
}

export default function World({
  homeTheme,
  placements,
  nodes,
  onOpenNode,
  site,
  campusSlug,
  campusPhaseId,
}: {
  homeTheme: string;
  placements: MlvWorldPlacement[];
  nodes: MlvNode[];
  onOpenNode: (node: MlvNode) => void;
  site: 'HOME' | 'CAMPUS' | 'GALLERY';
  campusSlug?: string | null;
  campusPhaseId?: string;
}) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const visiblePlacements = site === 'GALLERY'
    ? placements.filter((placement) => byId.get(placement.node_id)?.visibility === 'public')
    : site === 'HOME'
      ? placements
      : [];

  return (
    <Canvas camera={{ position: [0, 8, 10], fov: 55 }} style={{ width: '100%', height: '100%' }}>
      <color attach="background" args={[site === 'CAMPUS' ? '#6b8499' : '#87b5d9']} />
      <Suspense fallback={null}>
        <ambientLight intensity={0.45} />
        <directionalLight position={[8, 12, 6]} intensity={1} />
        {site !== 'CAMPUS' && <Ground />}
        {site === 'HOME' && (
          <>
            <Home theme={homeTheme} />
            <Desk />
          </>
        )}
        {site === 'CAMPUS' && campusSlug && (
          <CampusWorld slug={campusSlug} phaseId={campusPhaseId || 'PILOT'} />
        )}
        {site === 'GALLERY' && (
          <Text position={[0, 3, -4]} fontSize={0.32} color="white" anchorX="center">
            Gallery
          </Text>
        )}
        {visiblePlacements.map((placement) => {
          const node = byId.get(placement.node_id);
          if (!node) return null;
          return (
            <WorldObject
              key={placement.id}
              placement={placement}
              node={node}
              onOpen={onOpenNode}
            />
          );
        })}
        <OrbitControls enablePan enableZoom enableRotate minDistance={4} maxDistance={22} />
      </Suspense>
    </Canvas>
  );
}
