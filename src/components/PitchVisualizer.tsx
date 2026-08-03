'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Pitch } from '@/types/pitch';

interface PitchVisualizerProps {
  pitch: Pitch;
  width?: number;
  height?: number;
}

const PitchVisualizer: React.FC<PitchVisualizerProps> = ({ 
  pitch, 
  width = 600, 
  height = 400 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw strike zone
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(width * 0.7, height * 0.3, width * 0.2, height * 0.4);

    // Draw home plate
    ctx.beginPath();
    ctx.moveTo(width * 0.8, height * 0.7);
    ctx.lineTo(width * 0.75, height * 0.75);
    ctx.lineTo(width * 0.85, height * 0.75);
    ctx.closePath();
    ctx.stroke();

    // Draw pitcher's mound
    ctx.beginPath();
    ctx.arc(width * 0.1, height * 0.7, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#ddd';
    ctx.fill();
    ctx.stroke();

    // Draw pitch trajectory
    if (animationProgress > 0) {
      const progress = animationProgress;
      
      // Calculate positions from physics-based trajectory data
      const t = progress;
      
      // Map release point to canvas (pitcher's mound side, left)
      const startX = width * 0.1 + pitch.trajectory.releaseX * 2;
      const startY = height * 0.7 - (pitch.trajectory.releaseY - 5) * 20;
      
      // Map target point to canvas (strike zone, right side)
      const endX = width * 0.8 + pitch.trajectory.targetX * 5;
      const endY = height * 0.7 - (pitch.trajectory.targetY - 2) * 20;

      // Calculate mid-point with break influence for a curved path
      const breakScaleX = pitch.trajectory.horizontalBreak / 15;  // -1 to +1 range
      const breakScaleY = pitch.trajectory.inducedVerticalBreak / 20; // -1 to +1 range
      
      const midX = (startX + endX) / 2 + breakScaleX * 30;
      const midY = (startY + endY) / 2 - breakScaleY * 25 + 10; // gravity sag

      // Quadratic Bézier: ball position along curve
      const ballX = Math.pow(1 - t, 2) * startX + 2 * (1 - t) * t * midX + Math.pow(t, 2) * endX;
      const ballY = Math.pow(1 - t, 2) * startY + 2 * (1 - t) * t * midY + Math.pow(t, 2) * endY;

      // Draw the path so far
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(midX, midY, ballX, ballY);
      
      ctx.strokeStyle = '#007bff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw the baseball
      ctx.beginPath();
      ctx.arc(ballX, ballY, 8, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw baseball seams
      ctx.beginPath();
      ctx.arc(ballX, ballY, 6, 0, Math.PI);
      ctx.strokeStyle = '#cc0000';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw labels
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.fillText('Pitcher', width * 0.1 - 20, height * 0.7 + 30);
    ctx.fillText('Home Plate', width * 0.8 - 25, height * 0.7 + 30);

  }, [pitch, width, height, animationProgress]);

  const animatePitch = () => {
    setIsAnimating(true);
    setAnimationProgress(0);
    
    const duration = 2000; // 2 seconds
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      setAnimationProgress(progress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };
    
    animate();
  };

  const resetAnimation = () => {
    setIsAnimating(false);
    setAnimationProgress(0);
  };

  return (
    <div className="pitch-visualizer">
      <div className="canvas-container" style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{ border: '1px solid #ddd', borderRadius: '8px' }}
        />
        <div className="controls" style={{ marginTop: '10px' }}>
          <button 
            onClick={animatePitch} 
            disabled={isAnimating}
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2 disabled:bg-gray-400"
          >
            {isAnimating ? 'Animating...' : 'Animate Pitch'}
          </button>
          <button 
            onClick={resetAnimation}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default PitchVisualizer;