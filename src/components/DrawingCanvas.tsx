/**
 * DrawingCanvas Component
 * High-performance canvas rendering layer for drawing input capture
 * Vector-first, time-aware, stateless rendering
 */

import { useEffect, useRef, useCallback } from 'react';
import { useDrawingStore } from '../store/drawingStore';
import { normalizePoint, denormalizePoint } from '../utils/normalization';
import type { Point, Stroke } from '../types';

interface DrawingCanvasProps {
  width: number;
  height: number;
  className?: string;
}

export function DrawingCanvas({ width, height, className }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  
  const {
    strokes,
    currentStroke,
    tool,
    style,
    isDrawing,
    startStroke,
    addPoint,
    endStroke,
    canvasSize,
  } = useDrawingStore();

  // Update canvas size in store when dimensions change
  useEffect(() => {
    useDrawingStore.getState().setCanvasSize({ w: width, h: height });
  }, [width, height]);

  // Render all strokes to canvas
  const renderStrokes = useCallback((ctx: CanvasRenderingContext2D, strokesToRender: Stroke[]) => {
    ctx.clearRect(0, 0, width, height);
    
    strokesToRender.forEach((stroke) => {
      if (stroke.points.length === 0) return;
      
      ctx.save();
      ctx.strokeStyle = stroke.style.color;
      ctx.lineWidth = stroke.style.width;
      ctx.globalAlpha = stroke.style.opacity;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (stroke.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }
      
      ctx.beginPath();
      
      const startPoint = denormalizePoint(
        stroke.points[0].x,
        stroke.points[0].y,
        width,
        height
      );
      ctx.moveTo(startPoint.x, startPoint.y);
      
      // Draw smooth curves between points
      for (let i = 1; i < stroke.points.length; i++) {
        const point = stroke.points[i];
        const denorm = denormalizePoint(point.x, point.y, width, height);
        
        if (i === 1) {
          ctx.lineTo(denorm.x, denorm.y);
        } else {
          // Use quadratic curves for smoother lines
          const prevPoint = stroke.points[i - 1];
          const prevDenorm = denormalizePoint(prevPoint.x, prevPoint.y, width, height);
          const midX = (prevDenorm.x + denorm.x) / 2;
          const midY = (prevDenorm.y + denorm.y) / 2;
          ctx.quadraticCurveTo(prevDenorm.x, prevDenorm.y, midX, midY);
        }
      }
      
      ctx.stroke();
      ctx.restore();
    });
  }, [width, height]);

  // Render current stroke being drawn
  const renderCurrentStroke = useCallback((ctx: CanvasRenderingContext2D, stroke: Stroke | null) => {
    if (!stroke || stroke.points.length === 0) return;
    
    ctx.save();
    ctx.strokeStyle = stroke.style.color;
    ctx.lineWidth = stroke.style.width;
    ctx.globalAlpha = stroke.style.opacity;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (stroke.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }
    
    ctx.beginPath();
    
    const startPoint = denormalizePoint(
      stroke.points[0].x,
      stroke.points[0].y,
      width,
      height
    );
    ctx.moveTo(startPoint.x, startPoint.y);
    
    for (let i = 1; i < stroke.points.length; i++) {
      const point = stroke.points[i];
      const denorm = denormalizePoint(point.x, point.y, width, height);
      
      if (i === 1) {
        ctx.lineTo(denorm.x, denorm.y);
      } else {
        const prevPoint = stroke.points[i - 1];
        const prevDenorm = denormalizePoint(prevPoint.x, prevPoint.y, width, height);
        const midX = (prevDenorm.x + denorm.x) / 2;
        const midY = (prevDenorm.y + denorm.y) / 2;
        ctx.quadraticCurveTo(prevDenorm.x, prevDenorm.y, midX, midY);
      }
    }
    
    ctx.stroke();
    ctx.restore();
  }, [width, height]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    
    // Set up high DPI rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    // Initial render
    renderStrokes(ctx, strokes);
    
    // Animation frame for smooth rendering
    let animationFrameId: number;
    
    const render = () => {
      renderStrokes(ctx, strokes);
      if (currentStroke) {
        renderCurrentStroke(ctx, currentStroke);
      }
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [strokes, currentStroke, renderStrokes, renderCurrentStroke, width, height]);

  // Get point from event
  const getPointFromEvent = useCallback((e: MouseEvent | TouchEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    let clientX: number;
    let clientY: number;
    let pressure = 0.5;
    
    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      // Try to get pressure from touch event if available
      if ('force' in e.touches[0] && typeof e.touches[0].force === 'number') {
        pressure = e.touches[0].force;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const normalized = normalizePoint(x, y, width, height);
    
    return {
      x: normalized.x,
      y: normalized.y,
      t: Date.now(),
      pressure: pressure > 0 ? pressure : undefined,
    };
  }, [width, height]);

  // Mouse/Touch handlers
  const handleStart = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    const point = getPointFromEvent(e);
    if (point) {
      isDrawingRef.current = true;
      startStroke(point);
    }
  }, [getPointFromEvent, startStroke]);

  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    const point = getPointFromEvent(e);
    if (point) {
      addPoint(point);
    }
  }, [getPointFromEvent, addPoint]);

  const handleEnd = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      endStroke();
    }
  }, [endStroke]);

  // Attach event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Mouse events
    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('mouseleave', handleEnd);
    
    // Touch events
    canvas.addEventListener('touchstart', handleStart, { passive: false });
    canvas.addEventListener('touchmove', handleMove, { passive: false });
    canvas.addEventListener('touchend', handleEnd);
    canvas.addEventListener('touchcancel', handleEnd);
    
    return () => {
      canvas.removeEventListener('mousedown', handleStart);
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('mouseup', handleEnd);
      canvas.removeEventListener('mouseleave', handleEnd);
      canvas.removeEventListener('touchstart', handleStart);
      canvas.removeEventListener('touchmove', handleMove);
      canvas.removeEventListener('touchend', handleEnd);
      canvas.removeEventListener('touchcancel', handleEnd);
    };
  }, [handleStart, handleMove, handleEnd]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        touchAction: 'none',
        userSelect: 'none',
        cursor: tool === 'eraser' ? 'grab' : 'crosshair',
      }}
    />
  );
}

