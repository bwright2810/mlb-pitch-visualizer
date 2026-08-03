'use client';

import React, { useState } from 'react';
import { Pitch, PITCH_TYPES } from '@/types/pitch';
import PitchCard from './PitchCard';

const PitchGrid: React.FC = () => {
  const [selectedPitch, setSelectedPitch] = useState<Pitch | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const filteredPitches = PITCH_TYPES.filter(pitch => {
    if (filter === 'all') return true;
    if (filter === 'fastballs') return pitch.name.toLowerCase().includes('fastball');
    if (filter === 'breaking') return ['curveball', 'slider', 'cutter'].includes(pitch.id);
    if (filter === 'offspeed') return ['changeup', 'splitter', 'knuckleball'].includes(pitch.id);
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === 'all' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All Pitches
        </button>
        <button
          onClick={() => setFilter('fastballs')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === 'fastballs' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Fastballs
        </button>
        <button
          onClick={() => setFilter('breaking')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === 'breaking' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Breaking Balls
        </button>
        <button
          onClick={() => setFilter('offspeed')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === 'offspeed' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Off-Speed
        </button>
      </div>

      {/* Pitch Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPitches.map((pitch) => (
          <PitchCard
            key={pitch.id}
            pitch={pitch}
            isSelected={selectedPitch?.id === pitch.id}
            onSelect={setSelectedPitch}
          />
        ))}
      </div>

      {/* Selected Pitch Details */}
      {selectedPitch && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
          <h3 className="text-2xl font-bold mb-4">Selected: {selectedPitch.name}</h3>
          <PitchCard pitch={selectedPitch} isSelected={true} />
        </div>
      )}

      {/* Pitch Type Statistics */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{PITCH_TYPES.filter(p => p.name.includes('Fastball')).length}</div>
          <div className="text-sm text-gray-600">Fastball Types</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-green-600">{PITCH_TYPES.filter(p => ['curveball', 'slider', 'cutter'].includes(p.id)).length}</div>
          <div className="text-sm text-gray-600">Breaking Balls</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-purple-600">{PITCH_TYPES.filter(p => ['changeup', 'splitter', 'knuckleball'].includes(p.id)).length}</div>
          <div className="text-sm text-gray-600">Off-Speed</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-orange-600">{PITCH_TYPES.length}</div>
          <div className="text-sm text-gray-600">Total Pitches</div>
        </div>
      </div>
    </div>
  );
};

export default PitchGrid;