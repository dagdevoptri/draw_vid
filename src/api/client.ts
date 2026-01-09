/**
 * API client for data transmission
 * Supports batch upload and incremental streaming (future)
 */

import type { DrawingPayload, DrawingSession } from '../types';
import { getInitData } from '../utils/telegram';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Prepare payload for transmission
 */
export function preparePayload(session: DrawingSession): DrawingPayload {
  return {
    sessionId: session.sessionId,
    userId: session.userId,
    canvasSize: session.canvasSize,
    strokes: session.strokes,
    intent: session.intent,
    timestamp: Date.now(),
  };
}


/**
 * Batch upload drawing session
 */
export async function uploadDrawingSession(
  session: DrawingSession
): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  try {
    const payload = preparePayload(session);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/drawings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Version': '1.0.0',
      },
      body: JSON.stringify({
        ...payload,
        initData: getInitData(),
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }
    
    const result = await response.json();
    return { success: true, sessionId: result.sessionId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Stream drawing updates (WebSocket - future implementation)
 */
export class DrawingStreamClient {
  private ws: WebSocket | null = null;
  private sessionId: string;
  
  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }
  
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = `${API_BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://')}/ws/drawings/${this.sessionId}`;
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        // Send auth
        this.ws?.send(JSON.stringify({
          type: 'auth',
          initData: getInitData(),
        }));
        resolve();
      };
      
      this.ws.onerror = (error) => {
        reject(error);
      };
    });
  }
  
  sendStroke(stroke: DrawingPayload['strokes'][0]): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    
    this.ws.send(JSON.stringify({
      type: 'stroke',
      data: stroke,
    }));
  }
  
  disconnect(): void {
    this.ws?.close();
    this.ws = null;
  }
}

