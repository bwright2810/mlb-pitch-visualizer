'use client';

import React from 'react';
import { Pitch } from '@/types/pitch';
import PitchVisualizer from './PitchVisualizer';

interface PitchCardProps {
  pitch: Pitch;
  isSelected?: boolean;
  onSelect?: (pitch: Pitch) => void;
}

const PitchCard: React.FC<PitchCardProps> = ({ pitch, isSelected = false, onSelect }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-orange-100 text-orange-800';
      case 'very hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBreakDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'vertical': return '↕️';
      case 'horizontal': return '↔️';
      case 'both': return '⤴️';
      default: return '⚾';
    }
  };

  return (
    <div 
      className={`border rounded-lg p-6 cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-lg' 
          : 'border-gray-200 bg-white hover:shadow-md'
      }`}
      onClick={() => onSelect?.(pitch)}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-900">{pitch.name}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(pitch.difficulty)}`}>
          {pitch.difficulty}
        </span>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pitch Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-600">Velocity:</span>
              <div className="text-gray-900">{pitch.velocity}</div>
            </div>
            <div>
              <span className="font-semibold text-gray-600">Spin Rate:</span>
              <div className="text-gray-900">{pitch.spinRate}</div>
            </div>
            <div>
              <span className="font-semibold text-gray-600">Movement:</span>
              <div className="text-gray-900 flex items-center gap-1">
                {getBreakDirectionIcon(pitch.breakDirection)}
                {pitch.movement}
              </div>
            </div>
            <div>
              <span className="font-semibold text-gray-600">Usage:</span>
              <div className="text-gray-900">{pitch.usage}</div>
            </div>
          </div>
          
          <div>
            <span className="font-semibold text-gray-600">Description:</span>
            <p className="text-gray-700 mt-1">{pitch.description}</p>
          </div>
          
          <div>
            <span className="font-semibold text-gray-600">Grip:</span>
            <p className="text-gray-700 mt-1">{pitch.gripDescription}</p>
            <div className="mt-2 p-3 bg-gray-100 rounded text-center">
              <span className="text-gray-500 text-sm">🎯 Grip Visualization Coming Soon</span>
            </div>
          </div>
        </div>
        
        {/* Pitch Visualization */}
        <div>
          <div className="mb-2">
            <span className="font-semibold text-gray-600">Trajectory:</span>
          </div>
          <PitchVisualizer pitch={pitch} width={300} height={200} />
        </div>
      </div>
    </div>
  );
};

export default PitchCard;