'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Line, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Pitch } from '@/types/pitch';
import {
  calculateBallPosition,
  calculateTrajectoryPoints,
  TrajectoryParams
} from '@/lib/trajectory';

const MOUND_TO_PLATE = 60.5;
const STRIKE_ZONE_WIDTH = 1.42;
const STRIKE_ZONE_HEIGHT = 1.84;
const MOUND_HEIGHT = 0.61;

function toTrajectoryParams(trajectory: Pitch['trajectory']): TrajectoryParams {
  return {
    releaseX: trajectory.releaseX,
    releaseY: trajectory.releaseY,
    releaseZ: trajectory.releaseZ,
    targetX: trajectory.targetX,
    targetY: trajectory.targetY,
    velocityMph: trajectory.velocityMph,
    inducedVerticalBreak: trajectory.inducedVerticalBreak,
    horizontalBreak: trajectory.horizontalBreak,
    isKnuckleball: trajectory.spinRateRpm < 500
  };
}

function BaseballMesh() {
  return (
    <group scale={1.2}>
      <mesh castShadow>
        <sphereGeometry args={[0.12, 48, 48]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.5} />
      </mesh>
      <group>
        <mesh rotation={[0, 0, Math.PI / 6]} position={[0, 0, 0.02]}>
          <torusGeometry args={[0.09, 0.012, 8, 32, Math.PI * 0.8]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.6} />
        </mesh>
        <mesh rotation={[0.8, 0, Math.PI / 3]} position={[-0.02, 0, 0]}>
          <torusGeometry args={[0.085, 0.012, 8, 32, Math.PI * 0.7]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.6} />
        </mesh>
        <mesh rotation={[1.6, 0, Math.PI / 4]} position={[0, -0.01, -0.02]}>
          <torusGeometry args={[0.08, 0.012, 8, 32, Math.PI * 0.75]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.6} />
        </mesh>
      </group>
      <group>
        <mesh rotation={[0, 0, -Math.PI / 6]} position={[0, 0, 0.02]}>
          <torusGeometry args={[0.09, 0.012, 8, 32, Math.PI * 0.8]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.6} />
        </mesh>
        <mesh rotation={[-0.8, 0, -Math.PI / 3]} position={[0.02, 0, 0]}>
          <torusGeometry args={[0.085, 0.012, 8, 32, Math.PI * 0.7]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.6} />
        </mesh>
        <mesh rotation={[-1.6, 0, -Math.PI / 4]} position={[0, -0.01, -0.02]}>
          <torusGeometry args={[0.08, 0.012, 8, 32, Math.PI * 0.75]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.6} />
        </mesh>
      </group>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
        <torusGeometry args={[0.07, 0.01, 6, 16, Math.PI * 0.3]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.6} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
        <torusGeometry args={[0.07, 0.01, 6, 16, Math.PI * 0.3]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.6} />
      </mesh>
    </group>
  );
}

function Baseball({ trajectory, isAnimating, progress, showResult, onPositionUpdate }: {
  trajectory: Pitch['trajectory'];
  isAnimating: boolean;
  progress: number;
  showResult: boolean;
  onPositionUpdate?: (pos: THREE.Vector3) => void;
}) {
  const spinGroupRef = useRef<THREE.Group>(null);
  const [rotationSpeed, setRotationSpeed] = useState(0.1);

  const params = useMemo(() => toTrajectoryParams(trajectory), [trajectory]);
  const currentPos = useMemo(() => calculateBallPosition(params, progress, showResult), [params, progress, showResult]);

  useEffect(() => {
    if (onPositionUpdate) onPositionUpdate(currentPos);
  }, [currentPos, onPositionUpdate]);

  useEffect(() => {
    const spinMultiplier = trajectory.spinRateRpm > 1000
      ? Math.min(trajectory.spinRateRpm / 1500, 3)
      : 0.3;
    setRotationSpeed(isAnimating ? spinMultiplier : 0.05);
  }, [isAnimating, trajectory.spinRateRpm]);

  useFrame((_, delta) => {
    if (spinGroupRef.current) {
      spinGroupRef.current.rotation.x += rotationSpeed * delta;
      spinGroupRef.current.rotation.z += rotationSpeed * delta * 0.5;
    }
  });

  return (
    <group position={[currentPos.x, currentPos.y, currentPos.z]}>
      <group ref={spinGroupRef}>
        <BaseballMesh />
      </group>
      {isAnimating && (
        <>
          <mesh>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshBasicMaterial color="#60a5fa" transparent opacity={0.25} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshBasicMaterial color="#93c5fd" transparent opacity={0.35} />
          </mesh>
        </>
      )}
    </group>
  );
}

function TrajectoryLine({ trajectory, progress, showResult }: {
  trajectory: Pitch['trajectory'];
  progress: number;
  showResult: boolean;
}) {
  const params = useMemo(() => toTrajectoryParams(trajectory), [trajectory]);

  const points = useMemo(() => {
    if (showResult) return calculateTrajectoryPoints(params, 120);
    if (progress > 0.02) {
      const trailPoints: THREE.Vector3[] = [];
      const startProgress = Math.max(0, progress - 0.15);
      const numPoints = Math.max(2, Math.floor((progress - startProgress) * 150));
      for (let i = 0; i <= numPoints; i++) {
        const t = startProgress + (i / numPoints) * (progress - startProgress);
        trailPoints.push(calculateBallPosition(params, t, false));
      }
      return trailPoints;
    }
    return [];
  }, [params, progress, showResult]);

  if (points.length < 2) return null;
  return <Line points={points} color="#60a5fa" lineWidth={2} opacity={showResult ? 0.8 : 0.6} transparent />;
}

function LandingIndicator({ trajectory, showResult }: {
  trajectory: Pitch['trajectory'];
  showResult: boolean;
}) {
  if (!showResult) return null;
  const x = trajectory.targetX;
  const y = trajectory.targetY;
  const zoneBottom = 1.5;
  const isInZone = Math.abs(x) < STRIKE_ZONE_WIDTH / 2 && y > zoneBottom && y < zoneBottom + STRIKE_ZONE_HEIGHT;

  return (
    <group position={[x, y, 0.5]}>
      <mesh>
        <ringGeometry args={[0.08, 0.12, 32]} />
        <meshBasicMaterial color={isInZone ? "#22c55e" : "#ef4444"} side={THREE.DoubleSide} />
      </mesh>
      <mesh>
        <circleGeometry args={[0.04, 16]} />
        <meshBasicMaterial color={isInZone ? "#22c55e" : "#ef4444"} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function PitchersMound() {
  return (
    <group position={[0, 0, MOUND_TO_PLATE]}>
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[9, 64]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
      <mesh position={[0, MOUND_HEIGHT + 0.02, 0]} castShadow>
        <boxGeometry args={[0.6, 0.03, 0.15]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
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
    <group position={[0, zoneCenter, 0.5]}>
      <mesh>
        <boxGeometry args={[STRIKE_ZONE_WIDTH, STRIKE_ZONE_HEIGHT, 0.02]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.15} />
      </mesh>
      <Line points={[[-STRIKE_ZONE_WIDTH/2, STRIKE_ZONE_HEIGHT/2, 0], [STRIKE_ZONE_WIDTH/2, STRIKE_ZONE_HEIGHT/2, 0]]} color="#60a5fa" lineWidth={2} />
      <Line points={[[-STRIKE_ZONE_WIDTH/2, -STRIKE_ZONE_HEIGHT/2, 0], [STRIKE_ZONE_WIDTH/2, -STRIKE_ZONE_HEIGHT/2, 0]]} color="#60a5fa" lineWidth={2} />
      <Line points={[[-STRIKE_ZONE_WIDTH/2, -STRIKE_ZONE_HEIGHT/2, 0], [-STRIKE_ZONE_WIDTH/2, STRIKE_ZONE_HEIGHT/2, 0]]} color="#60a5fa" lineWidth={2} />
      <Line points={[[STRIKE_ZONE_WIDTH/2, -STRIKE_ZONE_HEIGHT/2, 0], [STRIKE_ZONE_WIDTH/2, STRIKE_ZONE_HEIGHT/2, 0]]} color="#60a5fa" lineWidth={2} />
      <Line points={[[-STRIKE_ZONE_WIDTH/2, 0, 0], [STRIKE_ZONE_WIDTH/2, 0, 0]]} color="#60a5fa" lineWidth={1} transparent opacity={0.5} />
      <Line points={[[0, -STRIKE_ZONE_HEIGHT/2, 0], [0, STRIKE_ZONE_HEIGHT/2, 0]]} color="#60a5fa" lineWidth={1} transparent opacity={0.5} />
    </group>
  );
}

function BaseballField() {
  return (
    <group>
      <mesh position={[0, 0, MOUND_TO_PLATE / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[90, MOUND_TO_PLATE + 30]} />
        <meshStandardMaterial color="#C4A484" roughness={0.95} />
      </mesh>
      <mesh position={[0, -0.01, -50]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 100]} />
        <meshStandardMaterial color="#228B22" roughness={0.8} />
      </mesh>
    </group>
  );
}

function CameraController({
  isAnimating,
  showResult,
  sideView,
  ballPosition
}: {
  isAnimating: boolean;
  showResult: boolean;
  sideView: boolean;
  ballPosition: THREE.Vector3;
}) {
  const { camera } = useThree();
  const currentPos = useRef(new THREE.Vector3(2, 6.5, 63));
  const currentLookAt = useRef(new THREE.Vector3(0, 5.5, 55));

  // Define camera positions
  const initialPos = new THREE.Vector3(2, 6.5, 63);
  const initialLookAt = new THREE.Vector3(0, 5.5, 55);
  
  const zonePos = new THREE.Vector3(3, 3, 10);
  const zoneLookAt = new THREE.Vector3(0, 2.4, 0.5);
  
  // Side view: positioned on the right side of the field, looking at strike zone
  // Pitch travels from z≈55 (pitcher) to z≈0 (home plate)
  const sidePos = new THREE.Vector3(50, 10, 25);
  const sideLookAt = new THREE.Vector3(0, 2.5, 25);

  useFrame(() => {
    // Side view: OrbitControls takes over
    if (sideView && !isAnimating) {
      return;
    }

    let targetPos: THREE.Vector3;
    let targetLook: THREE.Vector3;
    let speed = 0.05;

    if (isAnimating) {
      // Track ball
      const camZ = ballPosition.z + 5;
      const camX = ballPosition.x * 0.5 + 1.5;
      const camY = Math.max(ballPosition.y + 2, 3);
      targetPos = new THREE.Vector3(camX, camY, Math.max(camZ, 8));
      targetLook = ballPosition.clone();
      speed = 0.12;
    } else if (sideView) {
      targetPos = sidePos;
      targetLook = sideLookAt;
      speed = 0.03;
    } else if (showResult) {
      targetPos = zonePos;
      targetLook = zoneLookAt;
      speed = 0.04;
    } else {
      targetPos = initialPos;
      targetLook = initialLookAt;
      speed = 0.05;
    }

    // Smooth lerp
    currentPos.current.lerp(targetPos, speed);
    currentLookAt.current.lerp(targetLook, speed);
    
    camera.position.copy(currentPos.current);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}

function SideViewControls({ enabled }: { enabled: boolean }) {
  return (
    <OrbitControls
      enabled={enabled}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={15}
      maxDistance={200}
      target={[0, 2.5, 25]}
    />
  );
}

export default function Scene3D({
  pitch,
  isAnimating,
  progress,
  showResult,
  sideView
}: {
  pitch: Pitch;
  isAnimating: boolean;
  progress: number;
  showResult: boolean;
  sideView: boolean;
}) {
  const [ballPosition, setBallPosition] = useState(new THREE.Vector3(0, 5, 55));

  const enableOrbitControls = sideView && !isAnimating;

  return (
    <Canvas
      shadows
      camera={{ position: [2, 6.5, 63], fov: 50 }}
      style={{ background: '#0a0a0a' }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow shadow-mapSize={[2048, 2048]} />
      <pointLight position={[0, 10, 30]} intensity={0.5} />

      <BaseballField />
      <PitchersMound />
      <HomePlate />
      <StrikeZone />

      <Baseball
        trajectory={pitch.trajectory}
        isAnimating={isAnimating}
        progress={progress}
        showResult={showResult}
        onPositionUpdate={setBallPosition}
      />

      <TrajectoryLine trajectory={pitch.trajectory} progress={progress} showResult={showResult} />
      <LandingIndicator trajectory={pitch.trajectory} showResult={showResult} />

      <CameraController
        isAnimating={isAnimating}
        showResult={showResult}
        sideView={sideView}
        ballPosition={ballPosition}
      />

      <SideViewControls enabled={enableOrbitControls} />

      <Environment preset="sunset" />
    </Canvas>
  );
}
