'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Pitch, PITCH_TYPES } from '@/types/pitch';
import { getFlightTimeMs } from '@/lib/trajectory';
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
  const [sideView, setSideView] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isPitchMenuOpen, setIsPitchMenuOpen] = useState(false);

  // Animation logic — uses real physics flight time
  const animatePitch = useCallback(() => {
    if (isAnimating) return;

    // Reset if showing result
    setShowResult(false);
    setSideView(false);
    setIsAnimating(true);
    setProgress(0);

    // Duration based on actual flight time from physics model
    // Scale to a comfortable animation speed (real time × 1.8 for visibility)
    const realFlightTimeMs = getFlightTimeMs(selectedPitch.trajectory);
    const duration = realFlightTimeMs * 1.8; // Slightly slower than real-time for clarity

    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(elapsed / duration, 1);

      setProgress(newProgress);

      if (newProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        setShowResult(true);
      }
    };

    requestAnimationFrame(animate);
  }, [isAnimating, selectedPitch]);

  // Reset function
  const resetAnimation = useCallback(() => {
    setIsAnimating(false);
    setProgress(0);
    setShowResult(false);
    setSideView(false);
  }, []);

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

  const getPitchIcon = (pitch: Pitch) => {
    const icons: Record<string, string> = {
      'fastball-4seam': '🔥', 'fastball-2seam': '🌀', curveball: '🌙',
      slider: '⚡', changeup: '🍂', cutter: '✂️', splitter: '↘️', knuckleball: '🫧',
    };
    return icons[pitch.id] || '⚾';
  };

  // Calculate if pitch is a strike using target position at plate
  const isStrike = () => {
    const x = selectedPitch.trajectory.targetX;
    const y = selectedPitch.trajectory.targetY;
    const zoneBottom = 1.5;
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
        {/* Main Grid */}
        <div>
          {/* 3D Visualizer */}
          <div className={`rounded-2xl overflow-hidden shadow-2xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="aspect-[15/14] sm:aspect-[20/21] lg:aspect-[16/9] relative">
              <Scene3D
                pitch={selectedPitch}
                isAnimating={isAnimating}
                progress={progress}
                showResult={showResult}
                sideView={sideView}
              />

              <div className="absolute top-4 left-4 z-10">
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={isPitchMenuOpen}
                  onClick={() => setIsPitchMenuOpen((open) => !open)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium shadow-lg backdrop-blur-md ${isDarkMode ? 'bg-gray-950/80 text-white' : 'bg-white/90 text-gray-900'}`}
                >
                  <span className="text-lg" aria-hidden="true">{getPitchIcon(selectedPitch)}</span>
                  <span>{selectedPitch.name}</span>
                  <span className="ml-1 text-xs opacity-70">⌄</span>
                </button>
                {isPitchMenuOpen && (
                  <div role="menu" className={`absolute left-0 mt-2 w-64 overflow-hidden rounded-xl border p-1 shadow-2xl backdrop-blur-xl ${isDarkMode ? 'border-gray-700 bg-gray-950/95' : 'border-gray-200 bg-white/95'}`}>
                    {PITCH_TYPES.map((pitch) => (
                      <button
                        key={pitch.id}
                        type="button"
                        role="menuitem"
                        onClick={() => { setSelectedPitch(pitch); resetAnimation(); setIsPitchMenuOpen(false); }}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${selectedPitch.id === pitch.id ? 'text-white' : isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}
                        style={selectedPitch.id === pitch.id ? { backgroundColor: pitch.color } : undefined}
                      >
                        <span className="w-6 text-center text-lg" aria-hidden="true">{getPitchIcon(pitch)}</span>
                        <span>{pitch.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Overlay controls */}
              <div className="absolute bottom-2 left-2 right-2">
                {/* Result indicator */}
                {showResult && (
                  <div className={`mb-2 px-3 py-1.5 rounded-md text-center text-sm font-bold ${
                    isStrike()
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {isStrike() ? '✓ STRIKE' : '✗ BALL'}
                  </div>
                )}

                <div className="flex gap-1.5">
                  <button
                    onClick={animatePitch}
                    disabled={isAnimating}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      isAnimating
                        ? 'bg-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
                    }`}
                  >
                    {isAnimating ? '🔄 Pitching...' : '▶️ Throw'}
                  </button>
                  {!isAnimating && (
                    <button
                      onClick={() => setSideView(!sideView)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                        sideView
                          ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg'
                          : isDarkMode
                            ? 'bg-gray-700 hover:bg-gray-600 text-white'
                            : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      {sideView ? '📺 Main' : '🎥 Side'}
                    </button>
                  )}
                  {(progress > 0 || showResult) && !isAnimating && (
                    <button
                      onClick={resetAnimation}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                      ↺
                    </button>
                  )}
                </div>
              </div>

              {/* Pitch name overlay */}
              <div className="absolute top-20 left-4 pointer-events-none">
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

              {/* Mobile scroll hint - appears after animation on mobile */}
              <div className={`absolute bottom-16 left-1/2 -translate-x-1/2 transition-opacity duration-500 sm:hidden pointer-events-none ${showResult && !isAnimating ? 'opacity-100' : 'opacity-0'}`}>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs animate-bounce ${isDarkMode ? 'bg-gray-800/70 text-gray-300' : 'bg-white/70 text-gray-600'}`}>
                  <span>↕</span> Scroll for details
                </div>
              </div>
            </div>
          </div>

          <p className={`mt-4 text-base leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {selectedPitch.description}
          </p>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* All pitch details in one card */}
          <div className={`lg:col-span-2 rounded-2xl p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-white shadow'}`}>
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

            {/* Break Stats */}
            <div className={`grid grid-cols-2 gap-3 ${isDarkMode ? 'text-white' : ''}`}>
              <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white shadow'}`}>
                <div className={`text-lg font-bold ${selectedPitch.trajectory.inducedVerticalBreak >= 0 ? 'text-cyan-400' : 'text-orange-400'}`}>
                  {selectedPitch.trajectory.inducedVerticalBreak > 0 ? '+' : ''}{selectedPitch.trajectory.inducedVerticalBreak}&quot;
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Induced Vert Break</div>
              </div>
              <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white shadow'}`}>
                <div className={`text-lg font-bold ${selectedPitch.trajectory.horizontalBreak >= 0 ? 'text-cyan-400' : 'text-orange-400'}`}>
                  {selectedPitch.trajectory.horizontalBreak > 0 ? '+' : ''}{selectedPitch.trajectory.horizontalBreak}&quot;
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Horizontal Break</div>
              </div>
            </div>

            {/* Extended Info */}
            <div className={`mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 ${isDarkMode ? 'text-white' : ''}`}>
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                <h4 className="font-semibold text-gray-400 text-sm mb-1">When to Use</h4>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{selectedPitch.usage}</p>
              </div>
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                <h4 className="font-semibold text-gray-400 text-sm mb-1">Break Direction</h4>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {selectedPitch.breakDirection === 'vertical' && 'Primary vertical movement (up/down)'}
                  {selectedPitch.breakDirection === 'horizontal' && 'Primary horizontal movement (left/right)'}
                  {selectedPitch.breakDirection === 'both' && 'Combination of vertical and horizontal movement'}
                </p>
              </div>
            </div>
          </div>
          <div className={`rounded-2xl p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-white shadow'}`}>
            <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : ''}`}>🖐️ Grip & Release</h3>
            <GripVisualization pitch={selectedPitch} />
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
            Physics-based trajectories with gravity, drag & Magnus force
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PitchHero;
