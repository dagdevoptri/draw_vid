/**
 * Input normalization and preprocessing utilities
 * Ensures consistent downstream behavior regardless of device or drawing style
 */

import type { Point, Stroke } from '../types';

/**
 * Normalize coordinates to [0-1] space
 */
export function normalizePoint(
  x: number,
  y: number,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  return {
    x: Math.max(0, Math.min(1, x / canvasWidth)),
    y: Math.max(0, Math.min(1, y / canvasHeight)),
  };
}

/**
 * Denormalize coordinates from [0-1] to canvas space
 */
export function denormalizePoint(
  x: number,
  y: number,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  return {
    x: x * canvasWidth,
    y: y * canvasHeight,
  };
}

/**
 * Calculate distance between two points
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Simplified Douglas-Peucker algorithm for stroke simplification
 * Reduces point count while preserving shape
 */
export function simplifyStroke(
  points: Point[],
  tolerance: number = 0.001
): Point[] {
  if (points.length <= 2) return points;

  const simplified: Point[] = [];
  
  function douglasPeucker(start: number, end: number) {
    if (start >= end) return;
    
    let maxDist = 0;
    let maxIndex = start;
    
    const startPoint = points[start];
    const endPoint = points[end];
    
    for (let i = start + 1; i < end; i++) {
      const dist = perpendicularDistance(points[i], startPoint, endPoint);
      if (dist > maxDist) {
        maxDist = dist;
        maxIndex = i;
      }
    }
    
    if (maxDist > tolerance) {
      douglasPeucker(start, maxIndex);
      simplified.push(points[maxIndex]);
      douglasPeucker(maxIndex, end);
    }
  }
  
  simplified.push(points[0]);
  douglasPeucker(0, points.length - 1);
  simplified.push(points[points.length - 1]);
  
  return simplified;
}

/**
 * Calculate perpendicular distance from point to line segment
 */
function perpendicularDistance(point: Point, lineStart: Point, lineEnd: Point): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  
  if (dx === 0 && dy === 0) {
    return distance(point, lineStart);
  }
  
  const t = Math.max(0, Math.min(1, 
    ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (dx * dx + dy * dy)
  ));
  
  const projX = lineStart.x + t * dx;
  const projY = lineStart.y + t * dy;
  
  return Math.sqrt(
    Math.pow(point.x - projX, 2) + Math.pow(point.y - projY, 2)
  );
}

/**
 * Filter out noise (micro-movements) from stroke
 */
export function filterNoise(points: Point[], minDistance: number = 0.002): Point[] {
  if (points.length === 0) return points;
  
  const filtered: Point[] = [points[0]];
  
  for (let i = 1; i < points.length; i++) {
    const dist = distance(filtered[filtered.length - 1], points[i]);
    if (dist >= minDistance) {
      filtered.push(points[i]);
    }
  }
  
  return filtered;
}

/**
 * Apply smoothing to stroke using Catmull-Rom spline approximation
 */
export function smoothStroke(points: Point[]): Point[] {
  if (points.length < 3) return points;
  
  const smoothed: Point[] = [points[0]];
  
  for (let i = 1; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[Math.min(points.length - 1, i + 1)];
    
    // Simple weighted average smoothing
    smoothed.push({
      x: 0.25 * p0.x + 0.5 * p1.x + 0.25 * p2.x,
      y: 0.25 * p0.y + 0.5 * p1.y + 0.25 * p2.y,
      t: p1.t,
      pressure: p1.pressure,
    });
  }
  
  smoothed.push(points[points.length - 1]);
  return smoothed;
}

/**
 * Preprocess stroke: filter noise, smooth, simplify
 */
export function preprocessStroke(stroke: Stroke): Stroke {
  let processedPoints = [...stroke.points];
  
  // Filter noise first
  processedPoints = filterNoise(processedPoints);
  
  // Apply smoothing
  processedPoints = smoothStroke(processedPoints);
  
  // Simplify if too many points
  if (processedPoints.length > 50) {
    processedPoints = simplifyStroke(processedPoints);
  }
  
  return {
    ...stroke,
    points: processedPoints,
  };
}

