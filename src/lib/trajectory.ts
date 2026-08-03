import * as THREE from 'three';

// ============================================================
// Physics-Based Baseball Trajectory Calculator
// ============================================================
// Uses real MLB physics: gravity, air drag, and Magnus force
// derived from Statcast induced vertical break (IVB) and
// horizontal break (HB) measurements.
//
// Key equations:
//   Flight time with drag:  T = (e^(k*d) - 1) / (k * v0)
//   Z position:             z(t) = z0 - (1/k) * ln(1 + k*v0*t)
//   Y position:             y(t) = y0 + vy0*t + 0.5*(-g + aMy)*t^2
//   X position:             x(t) = x0 + vx0*t + 0.5*aMx*t^2
//   Magnus accel:           aM = 2 * break_feet / T^2
//   Initial velocity:       vy0 = (yF-y0)/T - 0.5*(-g+aMy)*T
//                           vx0 = (xF-x0)/T - 0.5*aMx*T
// ============================================================

// Physics constants
const GRAVITY = 32.174;         // ft/s²
const MPH_TO_FPS = 1.467;      // convert mph to ft/s

// Drag model constants (verified against MLB pitch deceleration data)
const RHO = 0.002378;          // air density at sea level, slugs/ft³
const CD = 0.30;                // drag coefficient for baseball
const BALL_AREA = 0.0465;      // cross-sectional area, ft² (r = 1.46 in)
const BALL_MASS = 0.00994;     // baseball mass, slugs (5.125 oz)
const DRAG_K = 0.5 * RHO * CD * BALL_AREA / BALL_MASS; // ≈ 0.001670 ft⁻¹

export interface TrajectoryParams {
  // Release point (feet)
  releaseX: number;    // horizontal offset from center (negative = glove-side for RHP)
  releaseY: number;    // height at release
  releaseZ: number;    // distance from home plate

  // Target location at the front of home plate (feet)
  targetX: number;     // horizontal position at plate
  targetY: number;     // height at plate

  // Pitch characteristics
  velocityMph: number; // average release velocity for trajectory calc

  // Break values (inches) — Statcast convention
  // Induced Vertical Break: positive = "rises" relative to no-spin trajectory
  //   (e.g., fastball backspin partially counteracts gravity)
  //   negative = drops more than no-spin (e.g., curveball topspin adds to gravity)
  // Horizontal Break: positive = arm-side for RHP, negative = glove-side
  inducedVerticalBreak: number;
  horizontalBreak: number;

  // Knuckleball flag for chaotic wobble effect
  isKnuckleball?: boolean;
}

/**
 * Compute flight time accounting for aerodynamic drag.
 *
 * With drag deceleration proportional to v², the velocity decays as:
 *   v(t) = v0 / (1 + k * v0 * t)
 *
 * The distance traveled is:
 *   d(t) = (1/k) * ln(1 + k * v0 * t)
 *
 * Solving for the time to travel distance d:
 *   T = (e^(k*d) - 1) / (k * v0)
 */
function computeFlightTime(distance: number, v0Fps: number): number {
  const kd = DRAG_K * distance;
  const kv0 = DRAG_K * v0Fps;
  return (Math.exp(kd) - 1) / kv0;
}

/**
 * Calculate the 3D position of a baseball at a given progress (0–1).
 *
 * The trajectory is governed by:
 * - Gravity: constant -32.174 ft/s² downward
 * - Magnus force: derived from observed induced vertical break and horizontal break
 *   (aMy for vertical, aMx for horizontal, each = 2 * break / T²)
 * - Drag: exponential velocity decay along the flight path
 *
 * The initial velocity direction is computed to ensure the ball arrives
 * at (targetX, targetY, 0.5) at progress=1.0, after all forces have acted.
 */
export function calculateBallPosition(
  params: TrajectoryParams,
  progress: number,
  showResult: boolean
): THREE.Vector3 {
  const {
    releaseX, releaseY, releaseZ,
    targetX, targetY,
    velocityMph,
    inducedVerticalBreak, horizontalBreak,
    isKnuckleball
  } = params;

  // Convert break from inches to feet
  const ivbFeet = inducedVerticalBreak / 12;
  const hbFeet = horizontalBreak / 12;

  // Release speed in ft/s
  const v0 = velocityMph * MPH_TO_FPS;
  const distance = releaseZ - 0.5; // feet from release to plate front

  // Time of flight with drag correction
  const tFlight = computeFlightTime(distance, v0);

  // Magnus accelerations derived from observed break values
  // At t=T: displacement = 0.5 * aM * T² = break
  // Therefore: aM = 2 * break / T²
  const aMy = 2 * ivbFeet / (tFlight * tFlight);  // ft/s², positive = upward
  const aMx = 2 * hbFeet / (tFlight * tFlight);    // ft/s², positive = arm-side

  // Initial velocity components to arrive at target
  // y(T) = releaseY + vy0*T + 0.5*(-g + aMy)*T² = targetY
  // x(T) = releaseX + vx0*T + 0.5*aMx*T² = targetX
  const vy0 = (targetY - releaseY) / tFlight - 0.5 * (-GRAVITY + aMy) * tFlight;
  const vx0 = (targetX - releaseX) / tFlight - 0.5 * aMx * tFlight;

  if (showResult) {
    return new THREE.Vector3(targetX, Math.max(0.3, targetY), 0.5);
  }

  // Time at current progress
  const t = progress * tFlight;

  // Z position with drag deceleration
  // z(t) = releaseZ - (1/k) * ln(1 + k * v0 * t)
  const zFromRelease = (1 / DRAG_K) * Math.log(1 + DRAG_K * v0 * t);
  const z = releaseZ - zFromRelease;

  // Y position: gravity + Magnus (parabolic arc)
  // - Gravity pulls down continuously
  // - Magnus force creates "rise" (fastball) or extra drop (curveball)
  const y = releaseY + vy0 * t + 0.5 * (-GRAVITY + aMy) * t * t;

  // X position: Magnus force only (lateral break)
  const x = releaseX + vx0 * t + 0.5 * aMx * t * t;

  // Knuckleball wobble: deterministic chaotic perturbation
  // Uses multiple sine waves with irrational frequency ratios
  // to simulate unpredictable aerodynamic flutter
  let finalX = x;
  let finalY = y;
  if (isKnuckleball && progress > 0.05) {
    // Wobble amplitude increases as ball slows (drag makes it more erratic)
    const wobbleScale = 0.5 + progress * 1.5;
    finalX += wobbleScale * (
      0.12 * Math.sin(progress * 25.13) +
      0.08 * Math.sin(progress * 17.93 + 1.3) +
      0.05 * Math.sin(progress * 41.7 + 2.7)
    );
    finalY += wobbleScale * (
      0.08 * Math.sin(progress * 19.5 + 0.8) +
      0.06 * Math.sin(progress * 33.1 + 1.9) +
      0.04 * Math.sin(progress * 47.3 + 3.1)
    );
  }

  return new THREE.Vector3(finalX, Math.max(0.3, finalY), z);
}

/**
 * Calculate the gravity-only reference path using the pitch's actual launch
 * velocity. Unlike calculateBallPosition, this intentionally does not
 * re-aim the pitch to the target after removing break forces.
 */
export function calculateNoBreakBallPosition(
  params: TrajectoryParams,
  progress: number,
): THREE.Vector3 {
  const {
    releaseX, releaseY, releaseZ,
    targetX, targetY,
    velocityMph,
    inducedVerticalBreak, horizontalBreak,
  } = params;

  const ivbFeet = inducedVerticalBreak / 12;
  const hbFeet = horizontalBreak / 12;
  const v0 = velocityMph * MPH_TO_FPS;
  const distance = releaseZ - 0.5;
  const tFlight = computeFlightTime(distance, v0);
  const aMy = 2 * ivbFeet / (tFlight * tFlight);
  const aMx = 2 * hbFeet / (tFlight * tFlight);
  const vy0 = (targetY - releaseY) / tFlight - 0.5 * (-GRAVITY + aMy) * tFlight;
  const vx0 = (targetX - releaseX) / tFlight - 0.5 * aMx * tFlight;
  const t = progress * tFlight;
  const zFromRelease = (1 / DRAG_K) * Math.log(1 + DRAG_K * v0 * t);

  return new THREE.Vector3(
    releaseX + vx0 * t,
    Math.max(0.3, releaseY + vy0 * t - 0.5 * GRAVITY * t * t),
    releaseZ - zFromRelease,
  );
}

/**
 * Pre-compute an array of trajectory points for drawing the path.
 */
export function calculateTrajectoryPoints(
  params: TrajectoryParams,
  numPoints: number = 120
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= numPoints; i++) {
    const progress = i / numPoints;
    points.push(calculateBallPosition(params, progress, false));
  }
  return points;
}

/**
 * Get the flight time in milliseconds (for animation duration).
 * Accounts for drag deceleration.
 */
export function getFlightTimeMs(params: TrajectoryParams): number {
  const v0 = params.velocityMph * MPH_TO_FPS;
  const distance = params.releaseZ - 0.5;
  return computeFlightTime(distance, v0) * 1000;
}

/**
 * Calculate the approach angle at the plate (degrees, negative = downward).
 * Useful for displaying pitch characteristics.
 */
export function getApproachAngle(params: TrajectoryParams): number {
  const {
    releaseX, releaseY, releaseZ,
    targetX, targetY,
    velocityMph,
    inducedVerticalBreak, horizontalBreak
  } = params;

  const ivbFeet = inducedVerticalBreak / 12;
  const hbFeet = horizontalBreak / 12;
  const v0 = velocityMph * MPH_TO_FPS;
  const distance = releaseZ - 0.5;
  const tFlight = computeFlightTime(distance, v0);

  const aMy = 2 * ivbFeet / (tFlight * tFlight);
  const aMx = 2 * hbFeet / (tFlight * tFlight);
  const vy0 = (targetY - releaseY) / tFlight - 0.5 * (-GRAVITY + aMy) * tFlight;
  const vx0 = (targetX - releaseX) / tFlight - 0.5 * aMx * tFlight;

  // Velocity at plate
  const vyPlate = vy0 + (-GRAVITY + aMy) * tFlight;
  const vPlate = v0 / (1 + DRAG_K * v0 * tFlight); // speed at plate

  // Approach angle in the vertical plane
  return Math.atan2(vyPlate, vPlate) * (180 / Math.PI);
}
