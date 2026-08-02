'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Pitch, PITCH_TYPES } from '@/types/pitch';
import GripVisualization from './GripVisualization';

// Constants for strike zone (must match Scene3D)
const STRIKE_ZONE_WIDTH = 1.42; // 17 inches
const STRIKE_ZONE_HEIGHT = 1.84; // 22 inches

// Dynamic import for 3D scene to avoid SSR issues
const Scene3D = dynamic(() => import('./Scene3D'), { ssr: false });

const PitchHero: React.FC = () => {
  const [selectedPitch, setSelectedPitch] = useState<Pitch>(PITCH_TYPES[0]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Animation logic
  const animatePitch = useCallback(() => {
    if (isAnimating) return;
    
    // Reset if showing result
    setShowResult(false);
    setIsAnimating(true);
    setProgress(0);
    
    // Duration based on pitch velocity (faster pitch = shorter animation)
    const avgVelocity = (selectedPitch.velocityRange[0] + selectedPitch.velocityRange[1]) / 2;
    const duration = 2200 - (avgVelocity - 60) * 12; // ~2.2s at 60mph, ~1s at 100mph
    
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(elapsed / duration, 1);
      
      setProgress(newProgress);
      
      if (newProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        // Show result after animation completes
        setTimeout(() => setShowResult(true), 200);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isAnimating, selectedPitch]);

  // Reset function
  const resetAnimation = useCallback(() => {
    setIsAnimating(false);
    setProgress(0);
    setShowResult(false);
  }, []);

  // Reset when pitch changes
  useEffect(() => {
    resetAnimation();
  }, [selectedPitch]);

  const getDifficultyBadge = (difficulty: string) => {
    const colors: Record<string, string> = {
      'easy': 'bg-green-500/20 text-green-400 border-green-500/30',
      'medium': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'hard': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'very hard': 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[difficulty] || colors['medium'];
  };

  const getBreakIcon = (direction: string) => {
    switch (direction) {
      case 'vertical': return '↕️';
      case 'horizontal': return '↔️';
      case 'both': return '⤴️';
      default: return '⚾';
    }
  };

  // Calculate if pitch is a strike - must match StrikeZone component
  const isStrike = () => {
    const x = selectedPitch.trajectory.horizontalBreak;
    const y = selectedPitch.trajectory.verticalBreak + 2.5;
    const zoneBottom = 1.5; // Must match StrikeZone component
    const zoneTop = zoneBottom + STRIKE_ZONE_HEIGHT;
    
    return Math.abs(x) < STRIKE_ZONE_WIDTH / 2 && 
           y > zoneBottom && 
           y < zoneTop;
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b ${isDarkMode ? 'bg-gray-950/80 border-gray-800' : 'bg-white/80 border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚾</span>
            <h1 className="text-lg sm:text-xl font-bold">MLB Pitch Visualizer</h1>
          </div>
          
          {/* Dark mode toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        {/* Pitch Selector */}
        <div className="mb-4 sm:mb-6">
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Select Pitch Type
          </label>
          <div className="flex flex-wrap gap-2">
            {PITCH_TYPES.map((pitch) => (
              <button
                key={pitch.id}
                onClick={() => setSelectedPitch(pitch)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedPitch.id === pitch.id
                    ? 'text-white shadow-lg'
                    : isDarkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                }`}
                style={selectedPitch.id === pitch.id ? { backgroundColor: pitch.color } : {}}
              >
                {pitch.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* 3D Visualizer */}
          <div className={`lg:col-span-2 rounded-2xl overflow-hidden shadow-2xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="aspect-video sm:aspect-[4/3] lg:aspect-[16/10] relative">
              <Scene3D 
                pitch={selectedPitch} 
                isAnimating={isAnimating} 
                progress={progress} 
                showResult={showResult}
              />
              
              {/* Overlay controls */}
              <div className="absolute bottom-4 left-4 right-4">
                {/* Result indicator */}
                {showResult && (
                  <div className={`mb-3 p-3 rounded-lg text-center font-bold ${
                    isStrike() 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {isStrike() ? '✓ STRIKE' : '✗ BALL'}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <button
                    onClick={animatePitch}
                    disabled={isAnimating}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                      isAnimating
                        ? 'bg-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
                    }`}
                  >
                    {isAnimating ? '🔄 Pitching...' : '▶️ Throw Pitch'}
                  </button>
                  {(progress > 0 || showResult) && !isAnimating && (
                    <button
                      onClick={resetAnimation}
                      className={`px-4 py-3 rounded-lg font-medium ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                      ↺ Reset
                    </button>
                  )}
                </div>
              </div>
              
              {/* Pitch name overlay */}
              <div className="absolute top-4 left-4">
                <h2 className="text-2xl sm:text-3xl font-bold drop-shadow-lg" style={{ color: selectedPitch.color }}>
                  {selectedPitch.name}
                </h2>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium border ${getDifficultyBadge(selectedPitch.difficulty)}`}>
                  {selectedPitch.difficulty.toUpperCase()}
                </span>
              </div>
              
              {/* Velocity indicator */}
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-mono ${isDarkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
                {selectedPitch.velocity}
              </div>
              
              {/* View mode indicator */}
              {showResult && (
                <div className={`absolute top-20 right-4 px-2 py-1 rounded text-xs ${isDarkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
                  Side View
                </div>
              )}
            </div>
          </div>

          {/* Stats Panel */}
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className={`grid grid-cols-2 gap-3 ${isDarkMode ? 'text-white' : ''}`}>
              <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white shadow'}`}>
                <div className="text-xl font-bold text-blue-400">{selectedPitch.velocity}</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Velocity</div>
              </div>
              <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white shadow'}`}>
                <div className="text-xl font-bold text-green-400">{selectedPitch.spinRate}</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Spin Rate</div>
              </div>
              <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white shadow'}`}>
                <div className="text-xl font-bold text-purple-400">{getBreakIcon(selectedPitch.breakDirection)}</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Movement</div>
              </div>
              <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white shadow'}`}>
                <div className={`text-xl font-bold ${isStrike() ? 'text-green-400' : 'text-red-400'}`}>
                  {isStrike() ? 'Strike' : 'Ball'}
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Result</div>
              </div>
            </div>

            {/* Description */}
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white shadow'}`}>
              <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : ''}`}>About This Pitch</h3>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {selectedPitch.description}
              </p>
            </div>

            {/* Grip Section - Always visible */}
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white shadow'}`}>
              <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : ''}`}>🖐️ Grip & Release</h3>
              <GripVisualization pitch={selectedPitch} />
            </div>

            {/* Extended Info - Always visible */}
            <div className={`space-y-3 ${isDarkMode ? 'text-white' : ''}`}>
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white shadow'}`}>
                <h4 className="font-semibold text-gray-400 text-sm mb-1">When to Use</h4>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{selectedPitch.usage}</p>
              </div>
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white shadow'}`}>
                <h4 className="font-semibold text-gray-400 text-sm mb-1">Break Direction</h4>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {selectedPitch.breakDirection === 'vertical' && 'Primary vertical movement (up/down)'}
                  {selectedPitch.breakDirection === 'horizontal' && 'Primary horizontal movement (left/right)'}
                  {selectedPitch.breakDirection === 'both' && 'Combination of vertical and horizontal movement'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`mt-8 py-6 border-t ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
            Built with Next.js, React Three Fiber & Tailwind CSS
          </p>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-600' : 'text-gray-500'}`}>
            Interactive 3D pitch visualization with physics-based trajectories
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PitchHero;
