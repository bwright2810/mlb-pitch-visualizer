'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Pitch, PITCH_TYPES } from '@/types/pitch';
import GripVisualization from './GripVisualization';

// Dynamic import for 3D scene to avoid SSR issues
const Scene3D = dynamic(() => import('./Scene3D'), { ssr: false });

const PitchHero: React.FC = () => {
  const [selectedPitch, setSelectedPitch] = useState<Pitch>(PITCH_TYPES[0]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showGrip, setShowGrip] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  // Animation logic
  const animatePitch = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setProgress(0);
    
    // Duration based on pitch velocity (faster pitch = shorter animation)
    const avgVelocity = (selectedPitch.velocityRange[0] + selectedPitch.velocityRange[1]) / 2;
    const duration = 2000 - (avgVelocity - 60) * 10; // 2s at 60mph, ~1s at 100mph
    
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(elapsed / duration, 1);
      
      setProgress(newProgress);
      
      if (newProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        // Keep progress at 1 to show final position
      }
    };
    
    requestAnimationFrame(animate);
  }, [isAnimating, selectedPitch]);

  // Reset animation when pitch changes
  useEffect(() => {
    setIsAnimating(false);
    setProgress(0);
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
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : isDarkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                }`}
              >
                {pitch.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* 3D Visualizer */}
          <div className={`rounded-2xl overflow-hidden shadow-2xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="aspect-video relative">
              <Scene3D pitch={selectedPitch} isAnimating={isAnimating} progress={progress} />
              
              {/* Overlay controls */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={animatePitch}
                    disabled={isAnimating}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      isAnimating
                        ? 'bg-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
                    }`}
                  >
                    {isAnimating ? '🔄 Pitching...' : '▶️ Throw Pitch'}
                  </button>
                  {!isAnimating && progress > 0 && (
                    <button
                      onClick={() => setProgress(0)}
                      className={`px-3 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                      ↺ Reset
                    </button>
                  )}
                </div>
                
                {/* Speed indicator */}
                <div className={`px-3 py-1 rounded-full text-sm font-mono ${isDarkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
                  {selectedPitch.velocity}
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
            </div>
          </div>

          {/* Stats Panel */}
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${isDarkMode ? 'text-white' : ''}`}>
              <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white shadow'}`}>
                <div className="text-2xl font-bold text-blue-400">{selectedPitch.velocity}</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Velocity</div>
              </div>
              <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white shadow'}`}>
                <div className="text-2xl font-bold text-green-400">{selectedPitch.spinRate}</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Spin Rate</div>
              </div>
              <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white shadow'}`}>
                <div className="text-2xl font-bold text-purple-400">{getBreakIcon(selectedPitch.breakDirection)} {selectedPitch.movement.split(' ')[0]}</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Movement</div>
              </div>
              <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white shadow'}`}>
                <div className="text-2xl font-bold text-orange-400">{selectedPitch.usage.split(' ')[0]}</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Primary Use</div>
              </div>
            </div>

            {/* Description */}
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white shadow'}`}>
              <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : ''}`}>About This Pitch</h3>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {selectedPitch.description}
              </p>
            </div>

            {/* Grip Section */}
            <div className={`rounded-xl overflow-hidden ${isDarkMode ? 'bg-gray-800/50' : 'bg-white shadow'}`}>
              <button
                onClick={() => setShowGrip(!showGrip)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
              >
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : ''}`}>🖐️ Grip & Release</h3>
                <span className={`transform transition-transform ${showGrip ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              
              {showGrip && (
                <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <GripVisualization pitch={selectedPitch} />
                </div>
              )}
            </div>

            {/* More Info Toggle */}
            <button
              onClick={() => setShowInfo(!showInfo)}
              className={`w-full p-3 rounded-xl text-center font-medium transition-colors ${
                isDarkMode ? 'bg-gray-800/50 hover:bg-gray-700/50' : 'bg-white shadow hover:bg-gray-50'
              }`}
            >
              {showInfo ? '▲ Less Details' : '▼ More Details'}
            </button>

            {/* Extended Info */}
            {showInfo && (
              <div className={`space-y-3 animate-in fade-in slide-in-from-top-4 ${isDarkMode ? 'text-white' : ''}`}>
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
            )}
          </div>
        </div>

        {/* Pitch Comparison */}
        <div className={`mt-8 p-4 rounded-2xl ${isDarkMode ? 'bg-gray-800/30' : 'bg-white/50'}`}>
          <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : ''}`}>All Pitch Types</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {PITCH_TYPES.map((pitch) => (
              <button
                key={pitch.id}
                onClick={() => setSelectedPitch(pitch)}
                className={`p-3 rounded-lg text-center transition-all ${
                  selectedPitch.id === pitch.id
                    ? 'ring-2 ring-blue-500 scale-105'
                    : 'hover:scale-102'
                } ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white shadow hover:shadow-md'}`}
              >
                <div className="text-2xl mb-1">⚾</div>
                <div className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {pitch.name.split(' ')[0]}
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`mt-12 py-6 border-t ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
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
