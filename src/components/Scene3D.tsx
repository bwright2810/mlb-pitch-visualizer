'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Line, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Pitch } from '@/types/pitch';
import {
  calculateBallPosition,
  calculateNoBreakBallPosition,
  calculateTrajectoryPoints,
  TrajectoryParams
} from '@/lib/trajectory';

const MOUND_TO_PLATE = 60.5;
const STRIKE_ZONE_WIDTH = 1.42;
const STRIKE_ZONE_HEIGHT = 1.84;
const MOUND_HEIGHT = 0.61;
const INITIAL_CAMERA_POS = new THREE.Vector3(2, 6.5, 63);
const INITIAL_CAMERA_LOOK_AT = new THREE.Vector3(0, 5.5, 55);
const ZONE_CAMERA_POS = new THREE.Vector3(3, 3, 10);
const ZONE_CAMERA_LOOK_AT = new THREE.Vector3(0, 2.4, 0.5);
const SIDE_CAMERA_POS = new THREE.Vector3(120, 10, 0);
const SIDE_CAMERA_LOOK_AT = new THREE.Vector3(0, 2.5, 0);

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
  const rotationSpeed = isAnimating
    ? trajectory.spinRateRpm > 1000
      ? Math.min(trajectory.spinRateRpm / 1500, 3)
      : 0.3
    : 0.05;

  const params = useMemo(() => toTrajectoryParams(trajectory), [trajectory]);
  const currentPos = useMemo(() => calculateBallPosition(params, progress, showResult), [params, progress, showResult]);

  useEffect(() => {
    if (onPositionUpdate) onPositionUpdate(currentPos);
  }, [currentPos, onPositionUpdate]);

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

function getVisibleTrajectoryPoints(
  params: TrajectoryParams,
  progress: number,
  showResult: boolean,
  positionCalculator: typeof calculateBallPosition = calculateBallPosition,
) {
  if (showResult) {
    if (positionCalculator === calculateBallPosition) return calculateTrajectoryPoints(params, 120);
    return Array.from({ length: 121 }, (_, index) => positionCalculator(params, index / 120, false));
  }
  if (progress <= 0.02) return [];

  const trailPoints: THREE.Vector3[] = [];
  const startProgress = Math.max(0, progress - 0.15);
  const numPoints = Math.max(2, Math.floor((progress - startProgress) * 150));
  for (let i = 0; i <= numPoints; i++) {
    const t = startProgress + (i / numPoints) * (progress - startProgress);
    trailPoints.push(positionCalculator(params, t, false));
  }
  return trailPoints;
}

function TrajectoryLine({ trajectory, pitchColor, progress, showResult }: {
  trajectory: Pitch['trajectory'];
  pitchColor: string;
  progress: number;
  showResult: boolean;
}) {
  const params = useMemo(() => toTrajectoryParams(trajectory), [trajectory]);
  const points = useMemo(() => {
    return getVisibleTrajectoryPoints(params, progress, showResult);
  }, [params, progress, showResult]);
  const noBreakPoints = useMemo(() => {
    return getVisibleTrajectoryPoints(params, progress, showResult, calculateNoBreakBallPosition);
  }, [params, progress, showResult]);

  if (points.length < 2 || noBreakPoints.length !== points.length) return null;

  const breakOffsets = points.map((point, index) => ({
    point,
    baseline: noBreakPoints[index],
    horizontal: point.x - noBreakPoints[index].x,
    vertical: point.y - noBreakPoints[index].y,
  }));
  const breakThreshold = 0.25 / 12;
  const vectorStep = Math.max(1, Math.floor(points.length / 8));
  const vectorIndices = breakOffsets
    .map(({ horizontal, vertical }, index) => ({ horizontal, vertical, index }))
    .filter(({ horizontal, vertical, index }) => (
      index > 0 && index % vectorStep === 0 && Math.hypot(horizontal, vertical) >= breakThreshold
    ));

  return (
    <group>
      <Line
        points={noBreakPoints}
        color="#64748b"
        lineWidth={1.25}
        opacity={0.45}
        dashed
        dashSize={0.35}
        gapSize={0.2}
        transparent
      />
      <Line
        points={points}
        color={pitchColor}
        lineWidth={3}
        opacity={showResult ? 0.95 : 0.85}
        transparent
      />
      {vectorIndices.map(({ horizontal, vertical, index }) => {
        const horizontalShare = Math.abs(horizontal) / (Math.abs(horizontal) + Math.abs(vertical) || 1);
        const color = new THREE.Color('#22d3ee').lerp(new THREE.Color('#f97316'), horizontalShare);
        return (
          <Line
            key={`break-vector-${index}`}
            points={[noBreakPoints[index], points[index]]}
            color={color}
            lineWidth={2}
            opacity={0.9}
            transparent
          />
        );
      })}
    </group>
  );
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
  const currentPos = useRef(INITIAL_CAMERA_POS.clone());
  const currentLookAt = useRef(INITIAL_CAMERA_LOOK_AT.clone());

  useEffect(() => {
    if (isAnimating) return;
    const targetPos = sideView ? SIDE_CAMERA_POS : showResult ? ZONE_CAMERA_POS : INITIAL_CAMERA_POS;
    const targetLook = sideView ? SIDE_CAMERA_LOOK_AT : showResult ? ZONE_CAMERA_LOOK_AT : INITIAL_CAMERA_LOOK_AT;
    camera.position.copy(targetPos);
    camera.lookAt(targetLook);
    currentPos.current.copy(targetPos);
    currentLookAt.current.copy(targetLook);
  }, [camera, isAnimating, showResult, sideView]);

  useFrame(() => {
    if (!isAnimating) return;
    const camZ = ballPosition.z + 5;
    const camX = ballPosition.x * 0.5 + 1.5;
    const camY = Math.max(ballPosition.y + 2, 3);
    const targetPos = new THREE.Vector3(camX, camY, Math.max(camZ, 8));
    const targetLook = ballPosition.clone();
    const speed = 0.12;

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
      touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
      minDistance={5}
      maxDistance={300}
      target={[0, 2.5, 0]}
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

  const enableOrbitControls = !isAnimating;

  return (
    <Canvas
      shadows
      camera={{ position: [2, 6.5, 63], fov: 50 }}
      style={{ background: '#0a0a0a', touchAction: enableOrbitControls ? 'none' : 'pan-y' }}
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

      <TrajectoryLine
        trajectory={pitch.trajectory}
        pitchColor={pitch.color}
        progress={progress}
        showResult={showResult}
      />
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
