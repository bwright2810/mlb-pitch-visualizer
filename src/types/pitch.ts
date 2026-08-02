// ============================================================
// MLB Pitch Types - Statcast-Based Trajectory Data
// ============================================================
// All break values are from MLB Statcast measurements for RHP.
//
// Induced Vertical Break (IVB):
//   - Positive = "rise" relative to no-spin trajectory
//     (fastball backspin partially counteracts gravity)
//   - Negative = extra drop beyond gravity
//     (curveball topspin adds to gravity)
//
// Horizontal Break (HB):
//   - Positive = arm-side movement (toward RHB for RHP)
//   - Negative = glove-side movement (away from RHB for RHP)
//
// Note: All pitches assume a right-handed pitcher (RHP).
// ============================================================

export interface Pitch {
  id: string;
  name: string;
  velocity: string;
  velocityRange: [number, number]; // min, max mph
  movement: string;
  description: string;
  gripImage: string;
  gripDescription: string;
  gripDetails: {
    fingerPositions: string;
    pressurePoints: string;
    releasePoint: string;
  };
  breakDirection: 'vertical' | 'horizontal' | 'both';
  spinRate: string;
  spinRateRange: [number, number]; // min, max rpm
  usage: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'very hard';
  color: string;

  // Physics-based trajectory parameters
  trajectory: {
    // Release point (feet) - typical RHP release positions
    releaseX: number;    // horizontal offset (negative = glove-side for RHP)
    releaseY: number;    // height at release
    releaseZ: number;    // distance from home plate (55 ft typical)

    // Target location at plate (feet)
    targetX: number;     // horizontal position at plate
    targetY: number;     // height at plate

    // Pitch characteristics
    velocityMph: number; // typical release velocity for trajectory

    // Statcast break values (inches)
    inducedVerticalBreak: number; // + = "rise", - = extra drop
    horizontalBreak: number;       // + = arm-side for RHP

    // Spin for ball rotation animation
    spinRateRpm: number;
    spinAxis: number;     // degrees from vertical (for visual spin direction)
  };
}

export const PITCH_TYPES: Pitch[] = [
  {
    id: 'fastball-4seam',
    name: 'Four-Seam Fastball',
    velocity: '92-100+ mph',
    velocityRange: [92, 102],
    movement: 'Ride & slight glove-side run',
    description: 'The most common fastball with pure backspin that creates lift, making it appear to "rise" as it approaches the plate. Hitters often swing under it because it drops less than expected.',
    gripImage: '/grips/four-seam.png',
    gripDescription: 'Fingers across the horseshoe seam',
    gripDetails: {
      fingerPositions: 'Index and middle fingers placed perpendicular across the horseshoe seams, with fingers close together but not touching',
      pressurePoints: 'Even pressure across both fingers, thumb directly underneath on smooth leather',
      releasePoint: 'Out in front, wrist snap creates backspin'
    },
    breakDirection: 'vertical',
    spinRate: '2200-2600 rpm',
    spinRateRange: [2200, 2600],
    usage: 'Primary pitch for most pitchers, used to get ahead in counts and induce swings and misses',
    difficulty: 'easy',
    color: '#ef4444',
    trajectory: {
      releaseX: -1.0,      // First-base side of rubber
      releaseY: 5.8,       // 5'10" release height
      releaseZ: 55,         // 55 ft from plate (pitcher's rubber at 60.5)
      targetX: 0,           // Center of plate
      targetY: 3.2,        // Upper zone (belt-high)
      velocityMph: 96,
      inducedVerticalBreak: 19,  // +19" = strong "rise" effect
      horizontalBreak: -7,       // -7" = slight glove-side run
      spinRateRpm: 2400,
      spinAxis: 195          // Near-pure backspin
    }
  },
  {
    id: 'fastball-2seam',
    name: 'Two-Seam Fastball',
    velocity: '90-97 mph',
    velocityRange: [90, 97],
    movement: 'Arm-side run & sink',
    description: 'Sinks and runs in on right-handed batters (for RHP), inducing weak contact and ground balls. The "tailing" action makes it hard to barrel up.',
    gripImage: '/grips/two-seam.png',
    gripDescription: 'Fingers along the narrow seams',
    gripDetails: {
      fingerPositions: 'Index and middle fingers placed along the narrow part of the seams, with fingers slightly spread',
      pressurePoints: 'Pressure on the inner seam with index finger, thumb underneath on the opposite seam',
      releasePoint: 'Slightly inside the ball, pronation creates movement'
    },
    breakDirection: 'both',
    spinRate: '2000-2400 rpm',
    spinRateRange: [2000, 2400],
    usage: 'Ground ball situations, inducing double plays, attacking same-side hitters',
    difficulty: 'medium',
    color: '#f97316',
    trajectory: {
      releaseX: -1.2,       // More first-base side
      releaseY: 5.7,
      releaseZ: 55,
      targetX: 0.6,         // Inner half to RHB
      targetY: 2.2,         // Lower zone
      velocityMph: 94,
      inducedVerticalBreak: 8,   // Less rise than 4-seam
      horizontalBreak: 14,       // +14" = strong arm-side run
      spinRateRpm: 2200,
      spinAxis: 150          // Tilted axis for run
    }
  },
  {
    id: 'curveball',
    name: 'Curveball',
    velocity: '74-84 mph',
    velocityRange: [74, 84],
    movement: '12-6 sharp drop',
    description: 'The classic "12-6" curveball drops straight down like an elevator, devastating when thrown for strikes. Creates huge velocity differential from fastballs.',
    gripImage: '/grips/curveball.png',
    gripDescription: 'Fingers along the seam, wrist pronated',
    gripDetails: {
      fingerPositions: 'Middle finger along the long seam, index finger resting beside it, ball deep in hand',
      pressurePoints: 'Middle finger on the seam, thumb on opposite seam creating a "C" grip',
      releasePoint: 'Palm faces the sky at release, fingers on top of ball creates topspin'
    },
    breakDirection: 'vertical',
    spinRate: '2500-3200 rpm',
    spinRateRange: [2500, 3200],
    usage: 'Strikeout pitch, especially with two strikes, freezing hitters with sharp break',
    difficulty: 'hard',
    color: '#22c55e',
    trajectory: {
      releaseX: -0.8,
      releaseY: 6.2,        // Higher release for arc
      releaseZ: 55,
      targetX: 0.3,         // Inner edge
      targetY: 1.8,         // Low strike
      velocityMph: 79,
      inducedVerticalBreak: -10,  // -10" = extra drop beyond gravity
      horizontalBreak: 8,         // +8" = arm-side sweep
      spinRateRpm: 2800,
      spinAxis: 15               // Near-topspin
    }
  },
  {
    id: 'slider',
    name: 'Slider',
    velocity: '82-90 mph',
    velocityRange: [82, 90],
    movement: 'Late glove-side break & drop',
    description: 'Breaks down and away from same-handed batters with late, sharp movement. Looks like a fastball until it suddenly darts away.',
    gripImage: '/grips/slider.png',
    gripDescription: 'Off-center grip with pressure on the outer seam',
    gripDetails: {
      fingerPositions: 'Index and middle fingers shifted to the outside of the ball, index finger off-center on the seam',
      pressurePoints: 'Index finger pressure on outer seam, thumb on the inside seam',
      releasePoint: 'Throw like a fastball with slight supination, release off index finger side'
    },
    breakDirection: 'both',
    spinRate: '2400-3000 rpm',
    spinRateRange: [2400, 3000],
    usage: 'Strikeout pitch, getting swings and misses, breaking bats',
    difficulty: 'medium',
    color: '#3b82f6',
    trajectory: {
      releaseX: -0.8,
      releaseY: 5.9,
      releaseZ: 55,
      targetX: -0.5,        // Outer edge to RHB
      targetY: 2.0,        // Lower zone
      velocityMph: 86,
      inducedVerticalBreak: 4,    // Slight rise but less than FB
      horizontalBreak: -9,        // -9" = glove-side sweep
      spinRateRpm: 2700,
      spinAxis: 45               // Diagonal spin axis
    }
  },
  {
    id: 'changeup',
    name: 'Changeup',
    velocity: '78-86 mph',
    velocityRange: [78, 86],
    movement: 'Fade & sink',
    description: 'The great equalizer - mimics fastball arm speed but arrives 10-15 mph slower. Creates awkward swings and called third strikes.',
    gripImage: '/grips/changeup.png',
    gripDescription: 'Deep grip in palm, circle or vulcan grip',
    gripDetails: {
      fingerPositions: 'Multiple variations: Circle change (thumb and index form circle), Vulcan (split fingers), or Three-finger (deep in palm)',
      pressurePoints: 'Ball deep in palm reduces velocity, pinky pressure can add fade',
      releasePoint: 'Same arm speed as fastball, release with palm facing slightly outward'
    },
    breakDirection: 'both',
    spinRate: '1600-2200 rpm',
    spinRateRange: [1600, 2200],
    usage: 'Off-speed pitch to disrupt timing, especially effective against opposite-handed hitters',
    difficulty: 'medium',
    color: '#a855f7',
    trajectory: {
      releaseX: -1.0,
      releaseY: 5.8,
      releaseZ: 55,
      targetX: 0.5,         // Inner half
      targetY: 2.0,         // Lower zone
      velocityMph: 85,
      inducedVerticalBreak: 7,    // Some fade
      horizontalBreak: 13,        // +13" = arm-side fade
      spinRateRpm: 1900,
      spinAxis: 135              // Tilted backspin
    }
  },
  {
    id: 'cutter',
    name: 'Cutter',
    velocity: '88-94 mph',
    velocityRange: [88, 94],
    movement: 'Late glove-side break',
    description: 'Mariano Rivera\'s signature pitch. A fastball that breaks late to the glove side, jamming hitters and sawing off bats.',
    gripImage: '/grips/cutter.png',
    gripDescription: 'Slightly off-center fastball grip',
    gripDetails: {
      fingerPositions: 'Like a fastball but fingers shifted slightly to the glove side of the ball',
      pressurePoints: 'Pressure on the middle finger, slightly off-center seam contact',
      releasePoint: 'Think "cut through" the ball, slight glove-side turn of wrist at release'
    },
    breakDirection: 'horizontal',
    spinRate: '2300-2700 rpm',
    spinRateRange: [2300, 2700],
    usage: 'Jamming hitters, inducing weak contact, setting up other pitches',
    difficulty: 'hard',
    color: '#ec4899',
    trajectory: {
      releaseX: -0.8,
      releaseY: 5.9,
      releaseZ: 55,
      targetX: -0.2,        // Outer edge
      targetY: 2.8,        // Middle zone
      velocityMph: 91,
      inducedVerticalBreak: 6,    // Some rise
      horizontalBreak: -5,         // -5" = glove-side cut
      spinRateRpm: 2500,
      spinAxis: 170              // Slightly tilted backspin
    }
  },
  {
    id: 'splitter',
    name: 'Split-Finger Fastball',
    velocity: '82-88 mph',
    velocityRange: [82, 88],
    movement: 'Sharp late drop',
    description: 'Splitting the fingers creates a pitch that looks like a fastball then falls off a table. Devastating when thrown low in the zone.',
    gripImage: '/grips/splitter.png',
    gripDescription: 'Ball split between index and middle fingers',
    gripDetails: {
      fingerPositions: 'Index and middle fingers split wide around the ball, like a "V" formation',
      pressurePoints: 'Fingers deep on the seams, thumb underneath, ball rests deeper in hand',
      releasePoint: 'Snap the wrist forward, release creates violent tumble'
    },
    breakDirection: 'vertical',
    spinRate: '1200-1800 rpm',
    spinRateRange: [1200, 1800],
    usage: 'Strikeout pitch, especially effective against power hitters chasing out of zone',
    difficulty: 'hard',
    color: '#14b8a6',
    trajectory: {
      releaseX: -0.8,
      releaseY: 6.0,
      releaseZ: 55,
      targetX: 0.2,
      targetY: 1.2,        // Below zone - bury it
      velocityMph: 86,
      inducedVerticalBreak: -5,   // -5" = extra drop
      horizontalBreak: 3,         // Slight arm-side
      spinRateRpm: 1500,
      spinAxis: 30                // Some topspin
    }
  },
  {
    id: 'knuckleball',
    name: 'Knuckleball',
    velocity: '62-72 mph',
    velocityRange: [62, 72],
    movement: 'Unpredictable dance',
    description: 'The most mysterious pitch in baseball. With almost no spin, air currents push it unpredictably - moving in ways neither the pitcher nor batter can predict.',
    gripImage: '/grips/knuckleball.png',
    gripDescription: 'Fingertips or knuckles on ball',
    gripDetails: {
      fingerPositions: 'Knuckles or fingertips dug into the ball, typically using 2-3 knuckles',
      pressurePoints: 'Even pressure from knuckles, thumb and pinky stabilize but dont push',
      releasePoint: 'Push the ball with fingertips, minimize spin at all costs'
    },
    breakDirection: 'both',
    spinRate: '100-500 rpm',
    spinRateRange: [100, 500],
    usage: 'Rare specialty pitch, requires total commitment to master',
    difficulty: 'very hard',
    color: '#eab308',
    trajectory: {
      releaseX: -0.8,
      releaseY: 5.8,
      releaseZ: 55,
      targetX: 0.1,
      targetY: 2.5,        // Middle zone
      velocityMph: 66,
      inducedVerticalBreak: -2,   // Minimal magnus effect
      horizontalBreak: 1,          // Slight movement
      spinRateRpm: 300,
      spinAxis: 90                 // Random axis
    }
  }
];
