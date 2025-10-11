import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere } from '@react-three/drei';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import * as THREE from 'three';

// House component
function House({ position, color, onClick }: { position: [number, number, number], color: string, onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group position={position} onClick={onClick}>
      <Box ref={meshRef} args={[2, 2, 2]} position={[0, 1, 0]}>
        <meshStandardMaterial color={color} />
      </Box>
      <Box args={[2.2, 0.2, 2.2]} position={[0, 2.1, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Box>
      <Box args={[0.4, 0.8, 0.1]} position={[1, 0.8, 0]}>
        <meshStandardMaterial color="#654321" />
      </Box>
    </group>
  );
}

// Player avatar component
function PlayerAvatar({ position, color, name }: { position: [number, number, number], color: string, name: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1;
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.3, 8, 8]} position={[0, 1, 0]}>
        <meshStandardMaterial color={color} />
      </Sphere>
      <Text
        position={[0, 2, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
    </group>
  );
}

// Ground component
function Ground() {
  return (
    <Box args={[20, 0.1, 20]} position={[0, -0.05, 0]}>
      <meshStandardMaterial color="#4a7c59" />
    </Box>
  );
}

// Main world component
function WorldScene({ onHouseClick }: { onHouseClick: (houseId: string) => void }) {
  
  // Sample houses data
  const houses = [
    { id: 'house1', position: [-6, 0, -6] as [number, number, number], color: '#ff6b6b', owner: 'gunnchOS3k' },
    { id: 'house2', position: [0, 0, -6] as [number, number, number], color: '#4ecdc4', owner: 'friend1' },
    { id: 'house3', position: [6, 0, -6] as [number, number, number], color: '#45b7d1', owner: 'friend2' },
    { id: 'house4', position: [-6, 0, 0] as [number, number, number], color: '#96ceb4', owner: 'friend3' },
    { id: 'house5', position: [6, 0, 0] as [number, number, number], color: '#feca57', owner: 'friend4' },
    { id: 'house6', position: [-6, 0, 6] as [number, number, number], color: '#ff9ff3', owner: 'friend5' },
    { id: 'house7', position: [0, 0, 6] as [number, number, number], color: '#54a0ff', owner: 'friend6' },
    { id: 'house8', position: [6, 0, 6] as [number, number, number], color: '#5f27cd', owner: 'friend7' },
  ];

  // Sample players data
  const players = [
    { id: 'player1', position: [2, 0, 2] as [number, number, number], color: '#ff6b6b', name: 'You' },
    { id: 'player2', position: [-2, 0, 2] as [number, number, number], color: '#4ecdc4', name: 'Friend1' },
    { id: 'player3', position: [0, 0, -2] as [number, number, number], color: '#45b7d1', name: 'Friend2' },
  ];

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      <Ground />
      
      {houses.map((house) => (
        <House
          key={house.id}
          position={house.position}
          color={house.color}
          onClick={() => onHouseClick(house.id)}
        />
      ))}
      
      {players.map((player) => (
        <PlayerAvatar
          key={player.id}
          position={player.position}
          color={player.color}
          name={player.name}
        />
      ))}
    </>
  );
}

// Loading component
function LoadingFallback() {
  return (
    <Text
      position={[0, 0, 0]}
      fontSize={0.5}
      color="white"
      anchorX="center"
      anchorY="middle"
    >
      Loading 3k MLV...
    </Text>
  );
}

// Main World component
export default function World({ onHouseClick }: { onHouseClick: (houseId: string) => void }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 2000);
  }, []);

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontSize: '1.5rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '1rem' }}>🏠</div>
          <div>Loading 3k MLV...</div>
          <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.7 }}>
            Setting up your cozy neighborhood
          </div>
        </div>
      </div>
    );
  }

  return (
    <Canvas
      camera={{ position: [0, 10, 10], fov: 60 }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={<LoadingFallback />}>
        <WorldScene onHouseClick={onHouseClick} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={20}
        />
      </Suspense>
    </Canvas>
  );
}
