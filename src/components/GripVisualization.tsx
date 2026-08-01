'use client';

import React from 'react';
import { Pitch } from '@/types/pitch';

interface GripVisualizationProps {
  pitch: Pitch;
}

const GripVisualization: React.FC<GripVisualizationProps> = ({ pitch }) => {
  // Get grip configuration based on pitch type
  const getGripConfig = () => {
    const baseConfig = {
      ballRadius: 80,
      center: { x: 150, y: 150 },
      seamColor: '#dc2626',
      leatherColor: '#f5f5f5',
      fingerColor: '#fcd34d',
      pressureHighColor: '#ef4444',
      pressureMediumColor: '#f97316',
      pressureLowColor: '#22c55e',
    };

    // Different grip patterns for different pitches
    const gripPatterns: Record<string, {
      fingers: Array<{ x: number; y: number; width: number; height: number; rotation: number; pressure: 'high' | 'medium' | 'low'; label: string }>;
      thumb: { x: number; y: number; rotation: number; pressure: 'high' | 'medium' | 'low' };
      seams: 'horseshoe' | 'narrow' | 'cross' | 'split';
    }> = {
      'fastball-4seam': {
        fingers: [
          { x: 120, y: 80, width: 20, height: 55, rotation: 5, pressure: 'medium', label: 'Index' },
          { x: 145, y: 75, width: 20, height: 55, rotation: -5, pressure: 'medium', label: 'Middle' },
        ],
        thumb: { x: 135, y: 200, rotation: 180, pressure: 'medium' },
        seams: 'horseshoe',
      },
      'fastball-2seam': {
        fingers: [
          { x: 115, y: 85, width: 22, height: 50, rotation: 10, pressure: 'high', label: 'Index' },
          { x: 145, y: 80, width: 22, height: 50, rotation: -5, pressure: 'medium', label: 'Middle' },
        ],
        thumb: { x: 130, y: 195, rotation: 175, pressure: 'medium' },
        seams: 'narrow',
      },
      'curveball': {
        fingers: [
          { x: 125, y: 70, width: 25, height: 60, rotation: 15, pressure: 'high', label: 'Middle' },
          { x: 155, y: 85, width: 18, height: 45, rotation: -10, pressure: 'low', label: 'Index' },
        ],
        thumb: { x: 120, y: 195, rotation: 170, pressure: 'high' },
        seams: 'narrow',
      },
      'slider': {
        fingers: [
          { x: 140, y: 75, width: 22, height: 52, rotation: 20, pressure: 'high', label: 'Index' },
          { x: 165, y: 90, width: 20, height: 48, rotation: 5, pressure: 'medium', label: 'Middle' },
        ],
        thumb: { x: 125, y: 190, rotation: 175, pressure: 'medium' },
        seams: 'horseshoe',
      },
      'changeup': {
        fingers: [
          { x: 110, y: 90, width: 20, height: 48, rotation: 5, pressure: 'low', label: 'Index' },
          { x: 135, y: 85, width: 20, height: 50, rotation: -5, pressure: 'low', label: 'Middle' },
          { x: 160, y: 95, width: 18, height: 45, rotation: -8, pressure: 'low', label: 'Ring' },
        ],
        thumb: { x: 135, y: 200, rotation: 180, pressure: 'medium' },
        seams: 'cross',
      },
      'cutter': {
        fingers: [
          { x: 135, y: 78, width: 20, height: 52, rotation: 8, pressure: 'medium', label: 'Index' },
          { x: 160, y: 82, width: 20, height: 52, rotation: -2, pressure: 'high', label: 'Middle' },
        ],
        thumb: { x: 140, y: 195, rotation: 178, pressure: 'medium' },
        seams: 'horseshoe',
      },
      'splitter': {
        fingers: [
          { x: 110, y: 75, width: 22, height: 55, rotation: 15, pressure: 'high', label: 'Index' },
          { x: 175, y: 80, width: 22, height: 55, rotation: -15, pressure: 'high', label: 'Middle' },
        ],
        thumb: { x: 145, y: 195, rotation: 180, pressure: 'medium' },
        seams: 'split',
      },
      'knuckleball': {
        fingers: [
          { x: 115, y: 65, width: 18, height: 35, rotation: 0, pressure: 'medium', label: 'Knuckles' },
          { x: 145, y: 60, width: 18, height: 35, rotation: 0, pressure: 'medium', label: '' },
          { x: 175, y: 68, width: 16, height: 30, rotation: 0, pressure: 'low', label: '' },
        ],
        thumb: { x: 145, y: 195, rotation: 185, pressure: 'low' },
        seams: 'cross',
      },
    };

    const pattern = gripPatterns[pitch.id] || gripPatterns['fastball-4seam'];
    return { ...baseConfig, ...pattern };
  };

  const config = getGripConfig();

  const getPressureColor = (pressure: 'high' | 'medium' | 'low') => {
    switch (pressure) {
      case 'high': return config.pressureHighColor;
      case 'medium': return config.pressureMediumColor;
      case 'low': return config.pressureLowColor;
    }
  };

  // Draw baseball seams based on grip type
  const renderSeams = () => {
    const { center, ballRadius, seamColor } = config;
    
    switch (config.seams) {
      case 'horseshoe':
        return (
          <>
            {/* Left horseshoe */}
            <path
              d={`M ${center.x - 25} ${center.y - 30} 
                  Q ${center.x - 45} ${center.y - 10} ${center.x - 40} ${center.y + 20}
                  Q ${center.x - 35} ${center.y + 50} ${center.x - 15} ${center.y + 60}`}
              fill="none"
              stroke={seamColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d={`M ${center.x - 20} ${center.y - 35} 
                  Q ${center.x - 42} ${center.y - 15} ${center.x - 38} ${center.y + 15}
                  Q ${center.x - 34} ${center.y + 45} ${center.x - 12} ${center.y + 55}`}
              fill="none"
              stroke={seamColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Right horseshoe */}
            <path
              d={`M ${center.x + 25} ${center.y - 30} 
                  Q ${center.x + 45} ${center.y - 10} ${center.x + 40} ${center.y + 20}
                  Q ${center.x + 35} ${center.y + 50} ${center.x + 15} ${center.y + 60}`}
              fill="none"
              stroke={seamColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d={`M ${center.x + 20} ${center.y - 35} 
                  Q ${center.x + 42} ${center.y - 15} ${center.x + 38} ${center.y + 15}
                  Q ${center.x + 34} ${center.y + 45} ${center.x + 12} ${center.y + 55}`}
              fill="none"
              stroke={seamColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
          </>
        );
      case 'narrow':
        return (
          <>
            {/* Narrow seams (for 2-seam) */}
            <path
              d={`M ${center.x - 55} ${center.y - 40}
                  Q ${center.x - 35} ${center.y} ${center.x - 55} ${center.y + 40}`}
              fill="none"
              stroke={seamColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d={`M ${center.x - 50} ${center.y - 45}
                  Q ${center.x - 30} ${center.y} ${center.x - 50} ${center.y + 45}`}
              fill="none"
              stroke={seamColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d={`M ${center.x + 55} ${center.y - 40}
                  Q ${center.x + 35} ${center.y} ${center.x + 55} ${center.y + 40}`}
              fill="none"
              stroke={seamColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d={`M ${center.x + 50} ${center.y - 45}
                  Q ${center.x + 30} ${center.y} ${center.x + 50} ${center.y + 45}`}
              fill="none"
              stroke={seamColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
          </>
        );
      case 'cross':
        return (
          <>
            {/* Cross seams */}
            <path
              d={`M ${center.x - 60} ${center.y - 20}
                  Q ${center.x - 20} ${center.y - 50} ${center.x + 20} ${center.y - 60}`}
              fill="none"
              stroke={seamColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d={`M ${center.x - 55} ${center.y - 15}
                  Q ${center.x - 15} ${center.y - 45} ${center.x + 25} ${center.y - 55}`}
              fill="none"
              stroke={seamColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d={`M ${center.x - 60} ${center.y + 20}
                  Q ${center.x - 20} ${center.y + 50} ${center.x + 20} ${center.y + 60}`}
              fill="none"
              stroke={seamColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d={`M ${center.x - 55} ${center.y + 15}
                  Q ${center.x - 15} ${center.y + 45} ${center.x + 25} ${center.y + 55}`}
              fill="none"
              stroke={seamColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
          </>
        );
      case 'split':
        return (
          <>
            {/* Split seams - wide apart */}
            <path
              d={`M ${center.x - 65} ${center.y - 30}
                  Q ${center.x - 50} ${center.y} ${center.x - 65} ${center.y + 30}`}
              fill="none"
              stroke={seamColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d={`M ${center.x - 60} ${center.y - 35}
                  Q ${center.x - 45} ${center.y} ${center.x - 60} ${center.y + 35}`}
              fill="none"
              stroke={seamColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d={`M ${center.x + 65} ${center.y - 30}
                  Q ${center.x + 50} ${center.y} ${center.x + 65} ${center.y + 30}`}
              fill="none"
              stroke={seamColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d={`M ${center.x + 60} ${center.y - 35}
                  Q ${center.x + 45} ${center.y} ${center.x + 60} ${center.y + 35}`}
              fill="none"
              stroke={seamColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
          </>
        );
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <svg viewBox="0 0 300 300" className="w-full h-auto">
        {/* Background */}
        <rect x="0" y="0" width="300" height="300" fill="#1a1a2e" rx="12" />
        
        {/* Baseball */}
        <circle
          cx={config.center.x}
          cy={config.center.y}
          r={config.ballRadius}
          fill={config.leatherColor}
          stroke="#d4d4d4"
          strokeWidth="2"
        />
        
        {/* Seams */}
        {renderSeams()}
        
        {/* Fingers */}
        {config.fingers.map((finger, index) => (
          <g key={index}>
            <ellipse
              cx={finger.x + finger.width / 2}
              cy={finger.y + finger.height / 2}
              rx={finger.width / 2}
              ry={finger.height / 2}
              fill={config.fingerColor}
              stroke={getPressureColor(finger.pressure)}
              strokeWidth="3"
              transform={`rotate(${finger.rotation} ${finger.x + finger.width / 2} ${finger.y + finger.height / 2})`}
              opacity="0.85"
            />
            {/* Pressure indicator */}
            <circle
              cx={finger.x + finger.width / 2}
              cy={finger.y + finger.height / 2}
              r={6}
              fill={getPressureColor(finger.pressure)}
              opacity="0.7"
              transform={`rotate(${finger.rotation} ${finger.x + finger.width / 2} ${finger.y + finger.height / 2})`}
            />
            {/* Label */}
            {finger.label && (
              <text
                x={finger.x + finger.width / 2}
                y={finger.y - 8}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="10"
                fontWeight="bold"
              >
                {finger.label}
              </text>
            )}
          </g>
        ))}
        
        {/* Thumb */}
        <g>
          <ellipse
            cx={config.thumb.x}
            cy={config.thumb.y}
            rx={18}
            ry={35}
            fill={config.fingerColor}
            stroke={getPressureColor(config.thumb.pressure)}
            strokeWidth="3"
            transform={`rotate(${config.thumb.rotation} ${config.thumb.x} ${config.thumb.y})`}
            opacity="0.85"
          />
          <circle
            cx={config.thumb.x}
            cy={config.thumb.y}
            r={6}
            fill={getPressureColor(config.thumb.pressure)}
            opacity="0.7"
            transform={`rotate(${config.thumb.rotation} ${config.thumb.x} ${config.thumb.y})`}
          />
          <text
            x={config.thumb.x}
            y={config.thumb.y + 50}
            textAnchor="middle"
            fill="#ffffff"
            fontSize="10"
            fontWeight="bold"
          >
            Thumb
          </text>
        </g>
        
        {/* Legend */}
        <g transform="translate(10, 260)">
          <text x="0" y="0" fill="#9ca3af" fontSize="10">Pressure:</text>
          <circle cx="60" cy="-3" r="5" fill={config.pressureHighColor} />
          <text x="70" y="0" fill="#9ca3af" fontSize="9">High</text>
          <circle cx="105" cy="-3" r="5" fill={config.pressureMediumColor} />
          <text x="115" y="0" fill="#9ca3af" fontSize="9">Medium</text>
          <circle cx="160" cy="-3" r="5" fill={config.pressureLowColor} />
          <text x="170" y="0" fill="#9ca3af" fontSize="9">Low</text>
        </g>
      </svg>
      
      {/* Grip details text */}
      <div className="mt-4 space-y-2 text-sm text-gray-300">
        <p><span className="text-gray-400 font-medium">Finger Position:</span> {pitch.gripDetails.fingerPositions}</p>
        <p><span className="text-gray-400 font-medium">Pressure:</span> {pitch.gripDetails.pressurePoints}</p>
        <p><span className="text-gray-400 font-medium">Release:</span> {pitch.gripDetails.releasePoint}</p>
      </div>
    </div>
  );
};

export default GripVisualization;
