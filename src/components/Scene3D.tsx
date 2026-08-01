'use client';

import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Text, Grid, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Pitch } from '@/types/pitch';

// Constants for baseball field dimensions (in feet)
const MOUND_TO_PLATE = 60.5;
const STRIKE_ZONE_WIDTH = 1.42; // 17 inches
const STRIKE_ZONE_HEIGHT = 1.84; // 22 inches (varies by batter)
const MOUND_HEIGHT = 0.61; // 10 inches

interface BaseballProps {
  position: [number, number, number];
  trajectory: Pitch['trajectory'];
  isAnimating: boolean;
  progress: number;
}

function Baseball({ position, trajectory, isAnimating, progress }: BaseballProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Points>(null);
  const [trailPositions, setTrailPositions] = useState<THREE.Vector3[]>([]);
  
  // Calculate position along trajectory using physics
  const currentPos = useMemo(() => {
    const t = progress;
    const startZ = trajectory.releaseZ;
    
    // Linear interpolation for distance
    const z = startZ * (1 - t);
    
    // Apply break - movement increases as ball gets closer (late break)
    const breakMultiplier = Math.pow(t, 1.5);
    const x = trajectory.releaseX * (1 - t) + trajectory.horizontalBreak * breakMultiplier;
    const y = trajectory.releaseY * (1 - t) + trajectory.verticalBreak * breakMultiplier;
    
    return new THREE.Vector3(x, Math.max(0.5, y), z);
  }, [progress, trajectory]);

  // Update trail
  useFrame(() => {
    if (isAnimating && meshRef.current && trailPositions.length < 100) {
      setTrailPositions(prev => [...prev, currentPos.clone()]);
    }
  });

  // Reset trail when not animating
  React.useEffect(() => {
    if (!isAnimating) {
      setTrailPositions([]);
    }
  }, [isAnimating]);

  // Trail geometry
  const trailGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    if (trailPositions.length > 0) {
      const positions = new Float32Array(trailPositions.length * 3);
      trailPositions.forEach((pos, i) => {
        positions[i * 3] = pos.x;
        positions[i * 3 + 1] = pos.y;
        positions[i * 3 + 2] = pos.z;
      });
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    }
    return geometry;
  }, [trailPositions]);

  return (
    <group>
      {/* Baseball */}
      <mesh ref={meshRef} position={isAnimating ? [currentPos.x, currentPos.y, currentPos.z] : position}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
        {/* Red seams */}
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[0.09, 0.01, 8, 32, Math.PI]} />
          <meshStandardMaterial color="#cc0000" />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.09, 0.01, 8, 32, Math.PI]} />
          <meshStandardMaterial color="#cc0000" />
        </mesh>
      </mesh>
      
      {/* Trail */}
      {trailPositions.length > 1 && (
        <points ref={trailRef} geometry={trailGeometry}>
          <pointsMaterial color="#3b82f6" size={0.05} transparent opacity={0.6} />
        </points>
      )}
    </group>
  );
}

function PitchersMound() {
  return (
    <group position={[0, 0, MOUND_TO_PLATE]}>
      {/* Mound circle */}
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[9, 64]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
      
      {/* Rubber */}
      <mesh position={[0, MOUND_HEIGHT + 0.02, 0]}>
        <boxGeometry args={[0.6, 0.03, 0.15]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Raised center */}
      <mesh position={[0, MOUND_HEIGHT / 2, 0]}>
        <coneGeometry args={[5.5, MOUND_HEIGHT, 32]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
    </group>
  );
}

function HomePlate() {
  return (
    <group position={[0, 0.02, 0]}>
      {/* Home plate shape (pentagon) */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.9, 5]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      
      {/* Batters box outline */}
      <mesh position={[0.75, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.2, 4]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} transparent opacity={0.5} />
      </mesh>
      <mesh position={[-0.75, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.2, 4]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

function StrikeZone() {
  const zoneBottom = 1.5; // Average strike zone bottom
  const zoneCenter = zoneBottom + STRIKE_ZONE_HEIGHT / 2;

  return (
    <group position={[0, zoneCenter, 0]}>
      {/* Transparent strike zone box */}
      <mesh>
        <boxGeometry args={[STRIKE_ZONE_WIDTH, STRIKE_ZONE_HEIGHT, 0.05]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.15} />
      </mesh>
      
      {/* Zone outline */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(STRIKE_ZONE_WIDTH, STRIKE_ZONE_HEIGHT, 0.05)]} />
        <lineBasicMaterial color="#60a5fa" />
      </lineSegments>
    </group>
  );
}

function BaseballField() {
  return (
    <group>
      {/* Infield dirt */}
      <mesh position={[0, 0, MOUND_TO_PLATE / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[90, MOUND_TO_PLATE + 30]} />
        <meshStandardMaterial color="#C4A484" roughness={0.95} />
      </mesh>
      
      {/* Grass approaching from outfield */}
      <mesh position={[0, -0.01, -50]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 100]} />
        <meshStandardMaterial color="#228B22" roughness={0.8} />
      </mesh>
      
      {/* Base paths */}
      <mesh position={[0, 0.01, 25]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[90, 30]} />
        <meshStandardMaterial color="#C4A484" roughness={0.95} />
      </mesh>
    </group>
  );
}

function CameraController({ pitchProgress, isAnimating }: { pitchProgress: number; isAnimating: boolean }) {
  const { camera } = useThree();
  const initialPosition = useMemo(() => new THREE.Vector3(2, 8, MOUND_TO_PLATE + 10), []);
  const initialLookAt = useMemo(() => new THREE.Vector3(0, 3, 30), []);

  useFrame(() => {
    if (isAnimating) {
      // Camera follows ball from pitcher's perspective
      const t = pitchProgress;
      
      // Start behind pitcher, end closer to plate
      const camX = initialPosition.x * (1 - t * 0.3);
      const camY = initialPosition.y * (1 - t * 0.4);
      const camZ = MOUND_TO_PLATE + 10 - t * (MOUND_TO_PLATE - 5);
      
      camera.position.set(camX, camY, camZ);
      
      // Look at where ball is going
      const lookZ = MOUND_TO_PLATE - t * MOUND_TO_PLATE;
      camera.lookAt(0, 4 - t * 2, lookZ);
    } else {
      // Return to initial position smoothly
      camera.position.lerp(initialPosition, 0.05);
      camera.lookAt(initialLookAt);
    }
  });

  return null;
}

interface Scene3DProps {
  pitch: Pitch;
  isAnimating: boolean;
  progress: number;
}

export default function Scene3D({ pitch, isAnimating, progress }: Scene3DProps) {
  return (
    <Canvas
      shadows
      className="w-full h-full"
      camera={{ position: [2, 8, MOUND_TO_PLATE + 10], fov: 50 }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[50, 50, 50]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[0, 10, MOUND_TO_PLATE]} intensity={0.5} />
      
      {/* Environment for reflections */}
      <Environment preset="sunset" />
      
      {/* Camera controller */}
      <CameraController pitchProgress={progress} isAnimating={isAnimating} />
      
      {/* Field elements */}
      <BaseballField />
      <PitchersMound />
      <HomePlate />
      <StrikeZone />
      
      {/* Baseball */}
      <Baseball
        position={[pitch.trajectory.releaseX, pitch.trajectory.releaseY, pitch.trajectory.releaseZ]}
        trajectory={pitch.trajectory}
        isAnimating={isAnimating}
        progress={progress}
      />
      
      {/* Grid helper (optional, for development) */}
      {/* <Grid infiniteGrid fadeDistance={100} sectionColor="#444" cellColor="#666" /> */}
      
      {/* Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={150}
        minPolarAngle={0.1}
        maxPolarAngle={Math.PI / 2 - 0.1}
      />
    </Canvas>
  );
}
