import { Box, Cylinder, Text } from '@react-three/drei';
import type { ModuleProps } from './types';

export function TerrainPlate({ position = [0, -0.05, 0], scale = [22, 0.1, 18], color = '#2f3d2f' }: ModuleProps) {
  return (
    <Box args={scale} position={position}>
      <meshStandardMaterial color={color} />
    </Box>
  );
}

export function MassBlock({ position = [0, 1, 0], scale = [4, 2, 3], color = '#888', label }: ModuleProps) {
  return (
    <group position={position}>
      <Box args={scale}>
        <meshStandardMaterial color={color} roughness={0.75} metalness={0.08} />
      </Box>
      {label ? (
        <Text position={[0, scale[1] / 2 + 0.35, 0]} fontSize={0.22} color="white" anchorX="center">
          {label}
        </Text>
      ) : null}
    </group>
  );
}

export function Canopy({ position = [0, 2.2, 0], scale = [5, 0.12, 3], color = '#c9a227' }: ModuleProps) {
  return (
    <Box args={scale} position={position}>
      <meshStandardMaterial color={color} transparent opacity={0.85} />
    </Box>
  );
}

export function Tower({ position = [0, 2.5, 0], scale = [1.2, 5, 1.2], color = '#4b5563', label }: ModuleProps) {
  return (
    <group position={position}>
      <Box args={scale}>
        <meshStandardMaterial color={color} />
      </Box>
      {label ? (
        <Text position={[0, scale[1] / 2 + 0.3, 0]} fontSize={0.18} color="white" anchorX="center">
          {label}
        </Text>
      ) : null}
    </group>
  );
}

export function ModuleCylinder({ position = [0, 0.7, 0], scale = [1.2, 1.4, 1.2], color = '#94a3b8', label }: ModuleProps) {
  return (
    <group position={position}>
      <Cylinder args={[scale[0], scale[0], scale[1], 10]}>
        <meshStandardMaterial color={color} />
      </Cylinder>
      {label ? (
        <Text position={[0, scale[1] / 2 + 0.3, 0]} fontSize={0.16} color="white" anchorX="center">
          {label}
        </Text>
      ) : null}
    </group>
  );
}

export function WaterEdge({ position = [0, -0.02, 6], scale = [22, 0.05, 4], color = '#1d4e6f' }: ModuleProps) {
  return (
    <Box args={scale} position={position}>
      <meshStandardMaterial color={color} metalness={0.3} roughness={0.25} />
    </Box>
  );
}

export function TruthLabel({ position = [0, 3.5, 0], text }: { position?: [number, number, number]; text: string }) {
  return (
    <Text position={position} fontSize={0.28} color="#fbbf24" anchorX="center" maxWidth={10}>
      {text}
    </Text>
  );
}
