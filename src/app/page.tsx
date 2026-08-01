'use client';

import React from 'react';
import PitchGrid from '@/components/PitchGrid';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              MLB Pitch Visualizer
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Explore and visualize the different types of baseball pitches used in Major League Baseball. 
              Learn about grips, movement patterns, velocities, and see animated trajectories.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PitchGrid />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600">
            <p>Built with Next.js, React, and Tailwind CSS</p>
            <p className="text-sm mt-2">Data and pitch information based on MLB pitching mechanics</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
