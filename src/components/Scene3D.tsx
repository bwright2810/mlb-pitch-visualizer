'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Line, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Pitch } from '@/types/pitch';

// Constants for baseball field dimensions (in feet)
const MOUND_TO_PLATE = 60.5;
const STRIKE_ZONE_WIDTH = 1.42; // 17 inches
const STRIKE_ZONE_HEIGHT = 1.84; // 22 inches
const MOUND_HEIGHT = 0.61; // 10 inches

interface BaseballProps {
  position: [number, number, number];
  trajectory: Pitch['trajectory'];
  isAnimating: boolean;
  progress: number;
  showResult: boolean;
}

// Create a baseball with seams texture
function BaseballMesh({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} scale={1.2}>
      {/* Main ball - white leather */}
      <mesh castShadow>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.3} />
      </mesh>
      
      {/* Red seams - curved lines */}
      {/* Left seam curve */}
      <Line
        points={[
          [0, 0.12, 0.05],
          [-0.08, 0.1, 0.1],
          [-0.12, 0.05, 0.12],
          [-0.13, -0.02, 0.12],
          [-0.12, -0.08, 0.1],
          [-0.08, -0.12, 0.05],
          [0, -0.14, 0],
        ]}
        color="#cc0000"
        lineWidth={2}
      />
      <Line
        points={[
          [0, 0.12, -0.05],
          [-0.08, 0.1, -0.1],
          [-0.12, 0.05, -0.12],
          [-0.13, -0.02, -0.12],
          [-0.12, -0.08, -0.1],
          [-0.08, -0.12, -0.05],
          [0, -0.14, 0],
        ]}
        color="#cc0000"
        lineWidth={2}
      />
      
      {/* Right seam curve */}
      <Line
        points={[
          [0, 0.12, 0.05],
          [0.08, 0.1, 0.1],
          [0.12, 0.05, 0.12],
          [0.13, -0.02, 0.12],
          [0.12, -0.08, 0.1],
          [0.08, -0.12, 0.05],
          [0, -0.14, 0],
        ]}
        color="#cc0000"
        lineWidth={2}
      />
      <Line
        points={[
          [0, 0.12, -0.05],
          [0.08, 0.1, -0.1],
          [0.12, 0.05, -0.12],
          [0.13, -0.02, -0.12],
          [0.12, -0.08, -0.1],
          [0.08, -0.12, -0.05],
          [0, -0.14, 0],
        ]}
        color="#cc0000"
        lineWidth={2}
      />
    </group>
  );
}

function Baseball({ position, trajectory, isAnimating, progress, showResult }: BaseballProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [rotationSpeed, setRotationSpeed] = useState(0.1);

  // Calculate final position (where ball ends up)
  const finalPos = useMemo(() => {
    const endZ = 0.5; // Near home plate
    const breakMultiplier = 1; // Full break at end
    const x = trajectory.releaseX * 0 + trajectory.horizontalBreak * breakMultiplier;
    const y = trajectory.releaseY * 0 + trajectory.verticalBreak * breakMultiplier + 2.5;
    return new THREE.Vector3(x, Math.max(0.5, y), endZ);
  }, [trajectory]);

  // Calculate position along trajectory
  const currentPos = useMemo(() => {
    if (showResult) return finalPos;
    
    const t = progress;
    const startZ = trajectory.releaseZ;
    
    // Linear interpolation for distance
    const z = startZ * (1 - t) + 0.5 * t;
    
    // Apply break - movement increases as ball gets closer (late break)
    const breakMultiplier = Math.pow(t, 1.5);
    const x = trajectory.releaseX * (1 - t) + trajectory.horizontalBreak * breakMultiplier;
    const y = trajectory.releaseY * (1 - t) + trajectory.verticalBreak * breakMultiplier + 2.5;
    
    return new THREE.Vector3(x, Math.max(0.3, y), z);
  }, [progress, trajectory, showResult, finalPos]);

  // Rotation speed based on spin rate
  useEffect(() => {
    const avgSpin = (trajectory.spinAxis || 180) / 180;
    setRotationSpeed(isAnimating ? avgSpin * 0.15 : 0.02);
  }, [isAnimating, trajectory.spinAxis]);

  // Spin the ball
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.x += rotationSpeed;
      groupRef.current.rotation.z += rotationSpeed * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      <BaseballMesh position={[currentPos.x, currentPos.y, currentPos.z]} />
    </group>
  );
}

// Trajectory line that shows the path
function TrajectoryLine({ 
  trajectory, 
  progress, 
  showResult 
}: { 
  trajectory: Pitch['trajectory']; 
  progress: number; 
  showResult: boolean;
}) {
  const points = useMemo(() => {
    const numPoints = showResult ? 100 : Math.floor(progress * 100) + 1;
    const linePoints: THREE.Vector3[] = [];
    
    for (let i = 0; i < numPoints; i++) {
      const t = showResult ? i / 99 : (i / 100) * progress;
      const startZ = trajectory.releaseZ;
      
      const z = startZ * (1 - t) + 0.5 * t;
      const breakMultiplier = Math.pow(t, 1.5);
      const x = trajectory.releaseX * (1 - t) + trajectory.horizontalBreak * breakMultiplier;
      const y = trajectory.releaseY * (1 - t) + trajectory.verticalBreak * breakMultiplier + 2.5;
      
      linePoints.push(new THREE.Vector3(x, Math.max(0.3, y), z));
    }
    
    return linePoints;
  }, [progress, trajectory, showResult]);

  if (points.length < 2) return null;

  return (
    <Line
      points={points}
      color="#3b82f6"
      lineWidth={3}
      opacity={0.8}
      transparent
    />
  );
}

// Landing indicator in strike zone
function LandingIndicator({ 
  trajectory, 
  showResult 
}: { 
  trajectory: Pitch['trajectory']; 
  showResult: boolean;
}) {
  if (!showResult) return null;

  const x = trajectory.horizontalBreak;
  const y = trajectory.verticalBreak + 2.5;
  const zoneCenter = 2.4;

  const isInZone = Math.abs(x) < STRIKE_ZONE_WIDTH / 2 && 
                   y > zoneCenter - STRIKE_ZONE_HEIGHT / 2 && 
                   y < zoneCenter + STRIKE_ZONE_HEIGHT / 2;

  return (
    <group position={[x, y, 0.1]}>
      {/* Impact circle */}
      <mesh>
        <ringGeometry args={[0.1, 0.15, 32]} />
        <meshBasicMaterial color={isInZone ? "#22c55e" : "#ef4444"} side={THREE.DoubleSide} />
      </mesh>
      {/* Center dot */}
      <mesh>
        <circleGeometry args={[0.05, 16]} />
        <meshBasicMaterial color={isInZone ? "#22c55e" : "#ef4444"} side={THREE.DoubleSide} />
      </mesh>
      {/* Label */}
      <Text
        position={[0, 0.4, 0]}
        fontSize={0.2}
        color={isInZone ? "#22c55e" : "#ef4444"}
        anchorX="center"
        anchorY="middle"
      >
        {isInZone ? "STRIKE" : "BALL"}
      </Text>
    </group>
  );
}

function PitchersMound() {
  return (
    <group position={[0, 0, MOUND_TO_PLATE]}>
      {/* Mound circle */}
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[9, 64]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
      
      {/* Rubber */}
      <mesh position={[0, MOUND_HEIGHT + 0.02, 0]} castShadow>
        <boxGeometry args={[0.6, 0.03, 0.15]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Raised center */}
      <mesh position={[0, MOUND_HEIGHT / 2, 0]} castShadow>
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
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <circleGeometry args={[0.9, 5]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
    </group>
  );
}

function StrikeZone() {
  const zoneBottom = 1.5;
  const zoneCenter = zoneBottom + STRIKE_ZONE_HEIGHT / 2;

  return (
    <group position={[0, zoneCenter, 0]}>
      {/* Transparent strike zone box */}
      <mesh>
        <boxGeometry args={[STRIKE_ZONE_WIDTH, STRIKE_ZONE_HEIGHT, 0.02]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.1} />
      </mesh>
      
      {/* Zone outline - top */}
      <Line
        points={[
          [-STRIKE_ZONE_WIDTH/2, STRIKE_ZONE_HEIGHT/2, 0],
          [STRIKE_ZONE_WIDTH/2, STRIKE_ZONE_HEIGHT/2, 0],
        ]}
        color="#60a5fa"
        lineWidth={2}
      />
      {/* Bottom */}
      <Line
        points={[
          [-STRIKE_ZONE_WIDTH/2, -STRIKE_ZONE_HEIGHT/2, 0],
          [STRIKE_ZONE_WIDTH/2, -STRIKE_ZONE_HEIGHT/2, 0],
        ]}
        color="#60a5fa"
        lineWidth={2}
      />
      {/* Left */}
      <Line
        points={[
          [-STRIKE_ZONE_WIDTH/2, -STRIKE_ZONE_HEIGHT/2, 0],
          [-STRIKE_ZONE_WIDTH/2, STRIKE_ZONE_HEIGHT/2, 0],
        ]}
        color="#60a5fa"
        lineWidth={2}
      />
      {/* Right */}
      <Line
        points={[
          [STRIKE_ZONE_WIDTH/2, -STRIKE_ZONE_HEIGHT/2, 0],
          [STRIKE_ZONE_WIDTH/2, STRIKE_ZONE_HEIGHT/2, 0],
        ]}
        color="#60a5fa"
        lineWidth={2}
      />
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
    </group>
  );
}

function CameraController({ 
  pitchProgress, 
  isAnimating, 
  showResult 
}: { 
  pitchProgress: number; 
  isAnimating: boolean;
  showResult: boolean;
}) {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3(1, 6, 62));
  const targetLookAt = useRef(new THREE.Vector3(0, 3, 0));
  
  // Initial pitcher view position (close behind pitcher)
  const pitcherViewPos = new THREE.Vector3(1, 6, 65);
  const pitcherLookAt = new THREE.Vector3(0, 4, 30);
  
  // Side view position (90 degree rotation)
  const sideViewPos = new THREE.Vector3(35, 5, 30);
  const sideLookAt = new THREE.Vector3(0, 3, 25);

  useFrame(() => {
    if (isAnimating) {
      // Camera follows ball from pitcher's perspective
      const t = pitchProgress;
      
      // Start close behind pitcher, follow ball towards plate
      const camX = pitcherViewPos.x * (1 - t * 0.3);
      const camY = pitcherViewPos.y * (1 - t * 0.3);
      const camZ = 65 - t * 55;
      
      targetPosition.current.set(camX, camY, camZ);
      targetLookAt.current.set(0, 4 - t * 1.5, 30 - t * 28);
    } else if (showResult) {
      // Switch to side view to show trajectory
      targetPosition.current.copy(sideViewPos);
      targetLookAt.current.copy(sideLookAt);
    } else {
      // Return to initial position
      targetPosition.current.copy(pitcherViewPos);
      targetLookAt.current.copy(pitcherLookAt);
    }
    
    // Smooth camera movement
    camera.position.lerp(targetPosition.current, 0.03);
  });

  return null;
}

interface Scene3DProps {
  pitch: Pitch;
  isAnimating: boolean;
  progress: number;
  showResult: boolean;
}

export default function Scene3D({ pitch, isAnimating, progress, showResult }: Scene3DProps) {
  return (
    <Canvas
      shadows
      className="w-full h-full"
      camera={{ position: [1, 6, 65], fov: 55, near: 0.1, far: 200 }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[50, 50, 30]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[0, 20, 30]} intensity={0.5} />
      
      {/* Environment */}
      <Environment preset="sunset" />
      
      {/* Camera controller */}
      <CameraController pitchProgress={progress} isAnimating={isAnimating} showResult={showResult} />
      
      {/* Field elements */}
      <BaseballField />
      <PitchersMound />
      <HomePlate />
      <StrikeZone />
      
      {/* Trajectory line */}
      <TrajectoryLine 
        trajectory={pitch.trajectory} 
        progress={progress} 
        showResult={showResult}
      />
      
      {/* Landing indicator */}
      <LandingIndicator trajectory={pitch.trajectory} showResult={showResult} />
      
      {/* Baseball */}
      <Baseball
        position={[pitch.trajectory.releaseX, pitch.trajectory.releaseY, pitch.trajectory.releaseZ]}
        trajectory={pitch.trajectory}
        isAnimating={isAnimating}
        progress={progress}
        showResult={showResult}
      />
      
      {/* Limited orbit controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableRotate={showResult}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2 - 0.1}
        target={[0, 3, 25]}
      />
    </Canvas>
  );
}
