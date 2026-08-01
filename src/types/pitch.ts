export interface Pitch {
  id: string;
  name: string;
  velocity: string;
  movement: string;
  description: string;
  gripImage: string;
  gripDescription: string;
  breakDirection: 'vertical' | 'horizontal' | 'both';
  spinRate: string;
  usage: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'very hard';
  trajectory: {
    startX: number;
    startY: number;
    controlPoints: { x: number; y: number }[];
    endX: number;
    endY: number;
  };
}

export const PITCH_TYPES: Pitch[] = [
  {
    id: 'fastball-4seam',
    name: 'Four-Seam Fastball',
    velocity: '90-100+ mph',
    movement: 'Straight with slight rise',
    description: 'The most common fastball with backspin that creates lift, making it appear to rise as it approaches the plate.',
    gripImage: '/grips/four-seam.png',
    gripDescription: 'Fingers across the horseshoe seam, index and middle fingers perpendicular to the seams',
    breakDirection: 'vertical',
    spinRate: '2200-2600 rpm',
    usage: 'Primary pitch for most pitchers, used to get ahead in counts',
    difficulty: 'easy',
    trajectory: {
      startX: 0,
      startY: 0,
      controlPoints: [{ x: 0.3, y: 0.1 }, { x: 0.7, y: 0.05 }],
      endX: 1,
      endY: 0
    }
  },
  {
    id: 'fastball-2seam',
    name: 'Two-Seam Fastball',
    velocity: '88-95 mph',
    movement: 'Arm-side run and sink',
    description: 'Sinks and runs in on right-handed batters (for right-handed pitchers), induces ground balls.',
    gripImage: '/grips/two-seam.png',
    gripDescription: 'Fingers along the narrow seams, pressure on the inside of the ball',
    breakDirection: 'both',
    spinRate: '2000-2400 rpm',
    usage: 'Ground ball situations, inducing double plays',
    difficulty: 'medium',
    trajectory: {
      startX: 0,
      startY: 0,
      controlPoints: [{ x: 0.3, y: -0.1 }, { x: 0.7, y: -0.2 }],
      endX: 1,
      endY: -0.15
    }
  },
  {
    id: 'curveball',
    name: 'Curveball',
    velocity: '70-80 mph',
    movement: '12-6 downward break',
    description: 'Sharp downward break, often called the "12-6" curve when it drops straight down.',
    gripImage: '/grips/curveball.png',
    gripDescription: 'Fingers along the seam, wrist pronated, middle finger pressure',
    breakDirection: 'vertical',
    spinRate: '2500-3000 rpm',
    usage: 'Strikeout pitch, especially with two strikes',
    difficulty: 'hard',
    trajectory: {
      startX: 0,
      startY: 0,
      controlPoints: [{ x: 0.4, y: 0.2 }, { x: 0.7, y: -0.3 }],
      endX: 1,
      endY: -0.4
    }
  },
  {
    id: 'slider',
    name: 'Slider',
    velocity: '80-90 mph',
    movement: 'Sharp lateral and downward break',
    description: 'Breaks down and away from same-handed batters, looks like a fastball until it breaks.',
    gripImage: '/grips/slider.png',
    gripDescription: 'Off-center grip with pressure on the outer seam',
    breakDirection: 'both',
    spinRate: '2400-2800 rpm',
    usage: 'Strikeout pitch, breaking bats with late movement',
    difficulty: 'medium',
    trajectory: {
      startX: 0,
      startY: 0,
      controlPoints: [{ x: 0.4, y: 0.1 }, { x: 0.7, y: -0.2 }],
      endX: 1,
      endY: -0.15
    }
  },
  {
    id: 'changeup',
    name: 'Changeup',
    velocity: '75-85 mph',
    movement: 'Slight fade and sink',
    description: 'Slower pitch designed to disrupt timing, with arm-side fade.',
    gripImage: '/grips/changeup.png',
    gripDescription: 'Various grips (circle change, vulcan change, etc.), deep in the palm',
    breakDirection: 'both',
    spinRate: '1800-2200 rpm',
    usage: 'Off-speed pitch to keep hitters off balance',
    difficulty: 'medium',
    trajectory: {
      startX: 0,
      startY: 0,
      controlPoints: [{ x: 0.4, y: -0.05 }, { x: 0.7, y: -0.1 }],
      endX: 1,
      endY: -0.08
    }
  },
  {
    id: 'cutter',
    name: 'Cutter',
    velocity: '85-92 mph',
    movement: 'Late, sharp break glove-side',
    description: 'Hybrid between fastball and slider, breaks late and jams hitters.',
    gripImage: '/grips/cutter.png',
    gripDescription: 'Slightly off-center fastball grip with pressure on the outer seam',
    breakDirection: 'horizontal',
    spinRate: '2300-2700 rpm',
    usage: 'Jamming hitters, inducing weak contact',
    difficulty: 'hard',
    trajectory: {
      startX: 0,
      startY: 0,
      controlPoints: [{ x: 0.5, y: 0.05 }, { x: 0.8, y: 0.1 }],
      endX: 1,
      endY: 0.08
    }
  },
  {
    id: 'splitter',
    name: 'Split-Finger Fastball',
    velocity: '83-88 mph',
    movement: 'Sharp downward break',
    description: 'Drops sharply at the plate, similar to a forkball but thrown harder.',
    gripImage: '/grips/splitter.png',
    gripDescription: 'Ball split between index and middle fingers, deep in the hand',
    breakDirection: 'vertical',
    spinRate: '1500-2000 rpm',
    usage: 'Strikeout pitch, especially against power hitters',
    difficulty: 'hard',
    trajectory: {
      startX: 0,
      startY: 0,
      controlPoints: [{ x: 0.4, y: 0.1 }, { x: 0.7, y: -0.25 }],
      endX: 1,
      endY: -0.3
    }
  },
  {
    id: 'knuckleball',
    name: 'Knuckleball',
    velocity: '60-70 mph',
    movement: 'Erratic, unpredictable movement',
    description: 'Thrown with minimal spin, dances unpredictably due to air resistance.',
    gripImage: '/grips/knuckleball.png',
    gripDescription: 'Fingertips or knuckles on the ball, minimal spin',
    breakDirection: 'both',
    spinRate: '100-500 rpm',
    usage: 'Rare pitch used to confuse hitters',
    difficulty: 'very hard',
    trajectory: {
      startX: 0,
      startY: 0,
      controlPoints: [{ x: 0.3, y: 0.15 }, { x: 0.6, y: -0.1 }, { x: 0.8, y: 0.05 }],
      endX: 1,
      endY: -0.02
    }
  }
];