/**
 * Core data models for the drawing input system
 * Vector-first, time-aware, intent-separated architecture
 */

export type DrawingTool = "pen" | "eraser" | "shape" | "text";

export interface Point {
  x: number;          // normalized [0-1]
  y: number;          // normalized [0-1]
  t: number;          // timestamp (ms)
  pressure?: number;  // optional pressure [0-1]
}

export interface StrokeStyle {
  color: string;      // hex color
  width: number;      // stroke width in pixels
  opacity: number;    // [0-1]
}

export interface Stroke {
  strokeId: string;
  tool: DrawingTool;
  points: Point[];
  startTime: number;
  endTime: number;
  style: StrokeStyle;
}

export interface CanvasSize {
  w: number;
  h: number;
}

export interface DrawingIntent {
  action: "add_text_animation" | "highlight" | "animate" | "mask" | "none";
  text?: string;
  metadata?: Record<string, unknown>;
}

export interface DrawingSession {
  sessionId: string;
  userId: string;
  canvasSize: CanvasSize;
  strokes: Stroke[];
  intent: DrawingIntent;
  startTime: number;
  version: string;
}

export interface DrawingPayload {
  sessionId: string;
  userId: string;
  canvasSize: CanvasSize;
  strokes: Stroke[];
  intent: DrawingIntent;
  timestamp: number;
}

