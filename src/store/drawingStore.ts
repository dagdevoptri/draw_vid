/**
 * Zustand store for drawing state management
 * Manages strokes, canvas state, and drawing session
 */

import { create } from 'zustand';
import type { Stroke, DrawingTool, StrokeStyle, DrawingIntent, CanvasSize } from '../types';
import { generateStrokeId, generateSessionId } from '../utils/id';
import { preprocessStroke } from '../utils/normalization';

interface DrawingState {
  // Session data
  sessionId: string;
  userId: string;
  canvasSize: CanvasSize;
  startTime: number;
  
  // Drawing state
  strokes: Stroke[];
  currentStroke: Stroke | null;
  tool: DrawingTool;
  style: StrokeStyle;
  intent: DrawingIntent;
  
  // UI state
  isDrawing: boolean;
  undoStack: Stroke[][];
  redoStack: Stroke[][];
  
  // Actions
  setSessionId: (id: string) => void;
  setUserId: (id: string) => void;
  setCanvasSize: (size: CanvasSize) => void;
  setTool: (tool: DrawingTool) => void;
  setStyle: (style: Partial<StrokeStyle>) => void;
  setIntent: (intent: DrawingIntent) => void;
  
  startStroke: (point: { x: number; y: number; t: number; pressure?: number }) => void;
  addPoint: (point: { x: number; y: number; t: number; pressure?: number }) => void;
  endStroke: () => void;
  
  undo: () => void;
  redo: () => void;
  clear: () => void;
  
  getSessionData: () => {
    sessionId: string;
    userId: string;
    canvasSize: CanvasSize;
    strokes: Stroke[];
    intent: DrawingIntent;
    startTime: number;
    version: string;
  };
}

const defaultStyle: StrokeStyle = {
  color: '#000000',
  width: 3,
  opacity: 1,
};

const defaultIntent: DrawingIntent = {
  action: 'none',
};

export const useDrawingStore = create<DrawingState>((set, get) => ({
  // Initial state
  sessionId: generateSessionId(),
  userId: '',
  canvasSize: { w: 1080, h: 1920 },
  startTime: Date.now(),
  strokes: [],
  currentStroke: null,
  tool: 'pen',
  style: defaultStyle,
  intent: defaultIntent,
  isDrawing: false,
  undoStack: [],
  redoStack: [],
  
  // Setters
  setSessionId: (id) => set({ sessionId: id }),
  setUserId: (id) => set({ userId: id }),
  setCanvasSize: (size) => set({ canvasSize: size }),
  setTool: (tool) => set({ tool }),
  setStyle: (style) => set({ style: { ...get().style, ...style } }),
  setIntent: (intent) => set({ intent }),
  
  // Stroke management
  startStroke: (point) => {
    const { tool, style } = get();
    const now = Date.now();
    
    const stroke: Stroke = {
      strokeId: generateStrokeId(),
      tool,
      points: [point],
      startTime: now,
      endTime: now,
      style: { ...style },
    };
    
    // Save state for undo
    set((state) => ({
      currentStroke: stroke,
      isDrawing: true,
      undoStack: [...state.undoStack, [...state.strokes]],
      redoStack: [], // Clear redo when new stroke starts
    }));
  },
  
  addPoint: (point) => {
    const { currentStroke } = get();
    if (!currentStroke) return;
    
    set({
      currentStroke: {
        ...currentStroke,
        points: [...currentStroke.points, point],
        endTime: point.t,
      },
    });
  },
  
  endStroke: () => {
    const { currentStroke } = get();
    if (!currentStroke) return;
    
    // Preprocess stroke before adding to history
    const processedStroke = preprocessStroke(currentStroke);
    
    set((state) => ({
      strokes: [...state.strokes, processedStroke],
      currentStroke: null,
      isDrawing: false,
    }));
  },
  
  // Undo/Redo
  undo: () => {
    const { undoStack, strokes } = get();
    if (undoStack.length === 0) return;
    
    const previousState = undoStack[undoStack.length - 1];
    
    set({
      strokes: previousState,
      undoStack: undoStack.slice(0, -1),
      redoStack: [...get().redoStack, strokes],
    });
  },
  
  redo: () => {
    const { redoStack, strokes } = get();
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[redoStack.length - 1];
    
    set({
      strokes: nextState,
      undoStack: [...get().undoStack, strokes],
      redoStack: redoStack.slice(0, -1),
    });
  },
  
  clear: () => {
    set((state) => ({
      strokes: [],
      currentStroke: null,
      undoStack: [...state.undoStack, [...state.strokes]],
      redoStack: [],
    }));
  },
  
  // Export session data
  getSessionData: () => {
    const state = get();
    return {
      sessionId: state.sessionId,
      userId: state.userId,
      canvasSize: state.canvasSize,
      strokes: state.strokes,
      intent: state.intent,
      startTime: state.startTime,
      version: '1.0.0',
    };
  },
}));

