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
  trajectory: Pitch['trajectory'];
  isAnimating: boolean;
  progress: number;
  showResult: boolean;
  onPositionUpdate?: (pos: THREE.Vector3) => void;
}

// Create a baseball with seams texture
function BaseballMesh({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} scale={1.5}>
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

// Calculate ball trajectory position (shared logic)
function calculateBallPosition(
  trajectory: Pitch['trajectory'], 
  progress: number, 
  showResult: boolean
): THREE.Vector3 {
  const pitcherZ = MOUND_TO_PLATE - 1;
  const releaseZ = pitcherZ - 2; // Ball released 2 feet in front of pitcher
  
  if (showResult) {
    // Final position at home plate
    const x = trajectory.horizontalBreak;
    const y = trajectory.verticalBreak + 2.5;
    return new THREE.Vector3(x, Math.max(0.5, y), 0.5);
  }
  
  const t = progress;
  
  // Interpolate from release point to home plate
  const z = releaseZ * (1 - t) + 0.5 * t;
  
  // Apply break - movement increases as ball gets closer (late break)
  const breakMultiplier = Math.pow(t, 1.5);
  const x = trajectory.releaseX * (1 - t) + trajectory.horizontalBreak * breakMultiplier;
  const y = trajectory.releaseY * (1 - t) + trajectory.verticalBreak * breakMultiplier + 2.5;
  
  return new THREE.Vector3(x, Math.max(0.3, y), z);
}

function Baseball({ trajectory, isAnimating, progress, showResult, onPositionUpdate }: BaseballProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [rotationSpeed, setRotationSpeed] = useState(0.1);

  // Calculate current position
  const currentPos = useMemo(() => {
    return calculateBallPosition(trajectory, progress, showResult);
  }, [progress, trajectory, showResult]);

  // Update parent with ball position
  useEffect(() => {
    if (onPositionUpdate) {
      onPositionUpdate(currentPos);
    }
  }, [currentPos, onPositionUpdate]);

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
      const pos = calculateBallPosition(trajectory, t, false);
      linePoints.push(pos);
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

// Generic Pitcher model
function Pitcher({ pitchProgress, isAnimating }: { pitchProgress: number; isAnimating: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const armRef = useRef<THREE.Group>(null);
  const frontLegRef = useRef<THREE.Group>(null);
  
  // Pitcher position on mound
  const pitcherZ = MOUND_TO_PLATE - 1;
  
  useFrame(() => {
    if (!groupRef.current) return;
    
    if (isAnimating && pitchProgress < 0.3) {
      // Wind-up phase - leg lift and arm back
      const phase = pitchProgress / 0.3;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(0, -0.4, phase);
      if (frontLegRef.current) {
        frontLegRef.current.rotation.x = THREE.MathUtils.lerp(0, -0.8, phase);
      }
      if (armRef.current) {
        armRef.current.rotation.x = THREE.MathUtils.lerp(0, -1.2, phase);
      }
    } else if (isAnimating && pitchProgress >= 0.3 && pitchProgress < 0.5) {
      // Throw phase - arm comes forward rapidly
      const phase = (pitchProgress - 0.3) / 0.2;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(-0.4, 0.3, phase);
      if (frontLegRef.current) {
        frontLegRef.current.rotation.x = THREE.MathUtils.lerp(-0.8, 0, phase);
      }
      if (armRef.current) {
        armRef.current.rotation.x = THREE.MathUtils.lerp(-1.2, 1.0, phase);
      }
    } else if (isAnimating && pitchProgress >= 0.5) {
      // Follow through
      const phase = Math.min((pitchProgress - 0.5) / 0.3, 1);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(0.3, 0.1, phase);
      if (armRef.current) {
        armRef.current.rotation.x = THREE.MathUtils.lerp(1.0, 0.5, phase);
      }
    } else {
      // Reset to ready position
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.05);
      if (frontLegRef.current) {
        frontLegRef.current.rotation.x = THREE.MathUtils.lerp(frontLegRef.current.rotation.x, 0, 0.05);
      }
      if (armRef.current) {
        armRef.current.rotation.x = THREE.MathUtils.lerp(armRef.current.rotation.x, 0, 0.05);
      }
    }
  });
  
  return (
    <group ref={groupRef} position={[0, 0, pitcherZ]}>
      {/* Body/Torso - jersey */}
      <mesh position={[0, 3.5, 0]} castShadow>
        <capsuleGeometry args={[0.35, 1.2, 8, 16]} />
n        <meshStandardMaterial color="#1e3a5f" roughness={0.7} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 4.8, 0]} castShadow>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#d4a574" roughness={0.6} />
      </mesh>
      
      {/* Cap */}
      <mesh position={[0, 5.15, 0]} castShadow>
        <cylinderGeometry args={[0.38, 0.42, 0.2, 16]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.8} />
      </mesh>
      <mesh position={[0, 5.1, 0.35]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.55, 0.05, 0.4]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.8} />
      </mesh>
      
      {/* Throwing arm (right arm for RHP) */}
      <group ref={armRef} position={[0.45, 4, 0]}>
        {/* Upper arm */}
        <mesh position={[0.25, 0, 0]} rotation={[0, 0, -Math.PI / 6]} castShadow>
          <capsuleGeometry args={[0.12, 0.5, 8, 16]} />
          <meshStandardMaterial color="#d4a574" roughness={0.6} />
        </mesh>
        {/* Forearm */}
        <mesh position={[0.5, -0.2, 0]} rotation={[0, 0, -Math.PI / 4]} castShadow>
          <capsuleGeometry args={[0.1, 0.45, 8, 16]} />
          <meshStandardMaterial color="#d4a574" roughness={0.6} />
        </mesh>
        {/* Hand */}
        <mesh position={[0.65, -0.35, 0]} castShadow>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#d4a574" roughness={0.6} />
        </mesh>
      </group>
      
      {/* Glove arm (left arm) - held in front */}
      <group position={[-0.45, 4, 0]}>
        <mesh position={[-0.3, 0.1, 0.3]} rotation={[0.5, 0.3, Math.PI / 6]} castShadow>
          <capsuleGeometry args={[0.12, 0.5, 8, 16]} />
          <meshStandardMaterial color="#d4a574" roughness={0.6} />
        </mesh>
        {/* Glove */}
        <mesh position={[-0.55, 0.1, 0.5]} castShadow>
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshStandardMaterial color="#8B4513" roughness={0.9} />
        </mesh>
      </group>
      
      {/* Legs */}
      <group position={[0, 2.2, 0]}>
        {/* Back leg (pivot/plant foot) */}
        <mesh position={[-0.2, -0.8, 0]} castShadow>
          <capsuleGeometry args={[0.15, 1.4, 8, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.7} />
        </mesh>
        {/* Front leg (stride leg) */}
        <group ref={frontLegRef} position={[0.2, -0.8, 0]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.15, 1.4, 8, 16]} />
            <meshStandardMaterial color="#ffffff" roughness={0.7} />
          </mesh>
          {/* Cleat */}
          <mesh position={[0, -0.9, 0.05]} castShadow>
            <boxGeometry args={[0.2, 0.1, 0.35]} />
            <meshStandardMaterial color="#333333" roughness={0.9} />
          </mesh>
        </group>
      </group>
      
      {/* Back cleat */}
      <mesh position={[-0.2, 0.6, 0.05]} castShadow>
        <boxGeometry args={[0.2, 0.1, 0.35]} />
        <meshStandardMaterial color="#333333" roughness={0.9} />
      </mesh>
    </group>
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
  showResult,
  ballPosition
}: { 
  pitchProgress: number; 
  isAnimating: boolean;
  showResult: boolean;
  ballPosition: THREE.Vector3;
}) {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3(3, 8, MOUND_TO_PLATE + 5));
  
  // Initial view position (behind and to the side of pitcher)
  const initialPos = new THREE.Vector3(3, 8, MOUND_TO_PLATE + 5);
  
  // Side view position for result
  const sideViewPos = new THREE.Vector3(30, 8, 20);
  
  // Home plate view
  const homePlatePos = new THREE.Vector3(5, 5, -8);

  useFrame(() => {
    if (isAnimating) {
      // Camera tracks the ball smoothly
      const pitcherZ = MOUND_TO_PLATE - 1;
      
      // Camera moves from behind pitcher towards home plate
      const t = pitchProgress;
      const camZ = (pitcherZ + 5) * (1 - t * 0.6) + (-5) * t * 0.6;
      const camX = 3 - t * 2;
      const camY = 8 - t * 3;
      
      targetPosition.current.set(camX, camY, camZ);
      
      // Look at the ball
      camera.lookAt(ballPosition);
    } else if (showResult) {
      // Smooth transition to side view
      targetPosition.current.lerp(sideViewPos, 0.03);
      camera.lookAt(0, 2.5, 5);
    } else {
      // Return to initial view
      targetPosition.current.lerp(initialPos, 0.03);
      camera.lookAt(0, 4, MOUND_TO_PLATE / 2);
    }
    
    // Smooth camera movement
    camera.position.lerp(targetPosition.current, 0.04);
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
  const [ballPosition, setBallPosition] = useState<THREE.Vector3>(
    calculateBallPosition(pitch.trajectory, 0, false)
  );
  
  // Calculate current ball position for camera tracking
  const currentBallPos = useMemo(() => {
    return calculateBallPosition(pitch.trajectory, progress, showResult);
  }, [pitch.trajectory, progress, showResult]);

  return (
    <Canvas
      shadows
      className="w-full h-full"
      camera={{ position: [3, 8, MOUND_TO_PLATE + 5], fov: 50, near: 0.1, far: 200 }}
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
      <CameraController 
        pitchProgress={progress} 
        isAnimating={isAnimating} 
        showResult={showResult}
        ballPosition={currentBallPos}
      />
      
      {/* Field elements */}
      <BaseballField />
      <PitchersMound />
      <HomePlate />
      <StrikeZone />
      
      {/* Pitcher */}
      <Pitcher pitchProgress={progress} isAnimating={isAnimating} />
      
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
