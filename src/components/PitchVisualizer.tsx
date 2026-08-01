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
    ctx.arc(width * 0.1, height * 0.5, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#ddd';
    ctx.fill();
    ctx.stroke();

    // Draw pitch trajectory
    if (animationProgress > 0) {
      const progress = animationProgress;
      
      // Calculate current position along the trajectory
      const t = progress;
      const startX = pitch.trajectory.startX * width;
      const startY = pitch.trajectory.startY * height + height * 0.5;
      
      // For Bézier curve animation
      const cp1X = pitch.trajectory.controlPoints[0].x * width;
      const cp1Y = pitch.trajectory.controlPoints[0].y * height + height * 0.5;
      const cp2X = pitch.trajectory.controlPoints[1].x * width;
      const cp2Y = pitch.trajectory.controlPoints[1].y * height + height * 0.5;
      const endX = pitch.trajectory.endX * width;
      const endY = pitch.trajectory.endY * height + height * 0.5;

      // Calculate current ball position
      const ballX = Math.pow(1 - t, 3) * startX + 
                   3 * Math.pow(1 - t, 2) * t * cp1X + 
                   3 * (1 - t) * Math.pow(t, 2) * cp2X + 
                   Math.pow(t, 3) * endX;
      
      const ballY = Math.pow(1 - t, 3) * startY + 
                   3 * Math.pow(1 - t, 2) * t * cp1Y + 
                   3 * (1 - t) * Math.pow(t, 2) * cp2Y + 
                   Math.pow(t, 3) * endY;

      // Draw the path so far
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      
      if (pitch.trajectory.controlPoints.length === 2) {
        ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, ballX, ballY);
      } else if (pitch.trajectory.controlPoints.length === 3) {
        // For knuckleball with multiple control points
        const cp3X = pitch.trajectory.controlPoints[2].x * width;
        const cp3Y = pitch.trajectory.controlPoints[2].y * height + height * 0.5;
        
        // Split into two curves
        const midT = 0.5;
        const midX = Math.pow(1 - midT, 3) * startX + 
                    3 * Math.pow(1 - midT, 2) * midT * cp1X + 
                    3 * (1 - midT) * Math.pow(midT, 2) * cp2X + 
                    Math.pow(midT, 3) * cp3X;
        const midY = Math.pow(1 - midT, 3) * startY + 
                    3 * Math.pow(1 - midT, 2) * midT * cp1Y + 
                    3 * (1 - midT) * Math.pow(midT, 2) * cp2Y + 
                    Math.pow(midT, 3) * cp3Y;
        
        if (t <= 0.5) {
          ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, midX, midY);
        } else {
          ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, midX, midY);
          const finalX = Math.pow(1 - (t-0.5)*2, 3) * midX + 
                        3 * Math.pow(1 - (t-0.5)*2, 2) * (t-0.5)*2 * cp2X + 
                        3 * (1 - (t-0.5)*2) * Math.pow((t-0.5)*2, 2) * cp3X + 
                        Math.pow((t-0.5)*2, 3) * endX;
          const finalY = Math.pow(1 - (t-0.5)*2, 3) * midY + 
                        3 * Math.pow(1 - (t-0.5)*2, 2) * (t-0.5)*2 * cp2Y + 
                        3 * (1 - (t-0.5)*2) * Math.pow((t-0.5)*2, 2) * cp3Y + 
                        Math.pow((t-0.5)*2, 3) * endY;
          ctx.lineTo(finalX, finalY);
        }
      }
      
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
    ctx.fillText('Pitcher', width * 0.1 - 20, height * 0.5 + 30);
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