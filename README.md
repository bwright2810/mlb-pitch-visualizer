# MLB Pitch Visualizer

An interactive web application built with Next.js that visually demonstrates different types of baseball pitches used in Major League Baseball. The app showcases pitch grips, trajectories, velocities, movement patterns, and detailed information about each pitch type.

## Features

- **Interactive Pitch Visualization**: Animated trajectories showing how each pitch moves from pitcher to plate
- **Comprehensive Pitch Database**: Information on 8 different pitch types including fastballs, breaking balls, and off-speed pitches
- **Detailed Pitch Information**: Velocity ranges, spin rates, movement descriptions, and usage scenarios
- **Grip Demonstrations**: Visual representations of how to grip each pitch (placeholder for future image integration)
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Filtering System**: Filter pitches by type (Fastballs, Breaking Balls, Off-Speed)

## Pitch Types Included

### Fastballs
- **Four-Seam Fastball**: Straight pitch with slight rise, 90-100+ mph
- **Two-Seam Fastball**: Sinks and runs arm-side, 88-95 mph
- **Cutter**: Late, sharp break glove-side, 85-92 mph

### Breaking Balls
- **Curveball**: 12-6 downward break, 70-80 mph
- **Slider**: Sharp lateral and downward break, 80-90 mph

### Off-Speed Pitches
- **Changeup**: Slight fade and sink, 75-85 mph
- **Split-Finger Fastball**: Sharp downward break, 83-88 mph
- **Knuckleball**: Erratic, unpredictable movement, 60-70 mph

## Tech Stack

- **Framework**: Next.js 16.2.12
- **Frontend**: React 19.2.4 with TypeScript
- **Styling**: Tailwind CSS 4
- **Animation**: HTML5 Canvas for pitch trajectories
- **Font**: Inter font family

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, pnpm, or bun package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mlb-pitch-visualizer
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # React components
│   ├── PitchCard.tsx    # Individual pitch display card
│   ├── PitchGrid.tsx    # Grid layout with filtering
│   └── PitchVisualizer.tsx # Canvas-based trajectory animation
└── types/
    └── pitch.ts         # TypeScript definitions and pitch data
```

## Features in Detail

### Pitch Visualization
Each pitch includes an animated trajectory visualization that shows:
- Starting point from the pitcher's mound
- Movement path through the air
- Break point and direction
- End location at home plate
- Interactive controls to play/reset animations

### Pitch Information
Detailed data for each pitch type:
- **Velocity Range**: Typical MLB speeds
- **Spin Rate**: RPM measurements
- **Movement Pattern**: Direction and type of break
- **Grip Description**: How to hold the ball
- **Usage Scenarios**: When and why pitchers use each pitch
- **Difficulty Level**: Learning difficulty for pitchers

## Future Enhancements

- [ ] Add actual grip images for each pitch type
- [ ] Include video demonstrations of real MLB pitchers
- [ ] Add pitch comparison tool
- [ ] Implement pitch sequencing examples
- [ ] Add pitch recognition training mode
- [ ] Include historical pitch data and statistics
- [ ] Add 3D visualization capabilities

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## License

This project is open source and available under the MIT License.