/**
 * Local storage utilities for saving/loading drawings
 */

import type { DrawingSession } from '../types';

const STORAGE_KEY = 'draw_vid_saved_drawings';
const MAX_SAVED = 50; // Maximum number of saved drawings

export interface SavedDrawing {
  id: string;
  session: DrawingSession;
  thumbnail?: string; // Base64 thumbnail
  savedAt: number;
  name?: string;
}

/**
 * Get all saved drawings
 */
export function getSavedDrawings(): SavedDrawing[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading saved drawings:', error);
    return [];
  }
}

/**
 * Save a drawing
 */
export function saveDrawing(session: DrawingSession, thumbnail?: string, name?: string): string {
  try {
    const saved = getSavedDrawings();
    const newDrawing: SavedDrawing = {
      id: `drawing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      session,
      thumbnail,
      savedAt: Date.now(),
      name: name || `Drawing ${saved.length + 1}`,
    };

    // Add to beginning and limit to MAX_SAVED
    saved.unshift(newDrawing);
    const limited = saved.slice(0, MAX_SAVED);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
    return newDrawing.id;
  } catch (error) {
    console.error('Error saving drawing:', error);
    throw error;
  }
}

/**
 * Delete a saved drawing
 */
export function deleteSavedDrawing(id: string): boolean {
  try {
    const saved = getSavedDrawings();
    const filtered = saved.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting drawing:', error);
    return false;
  }
}

/**
 * Get a saved drawing by ID
 */
export function getSavedDrawing(id: string): SavedDrawing | null {
  try {
    const saved = getSavedDrawings();
    return saved.find(d => d.id === id) || null;
  } catch (error) {
    console.error('Error getting drawing:', error);
    return null;
  }
}

/**
 * Generate thumbnail from canvas
 */
export function generateThumbnail(canvas: HTMLCanvasElement, size: number = 200): string {
  const thumbnail = document.createElement('canvas');
  thumbnail.width = size;
  thumbnail.height = size;
  
  const ctx = thumbnail.getContext('2d');
  if (!ctx) return '';

  // Calculate aspect ratio
  const aspect = canvas.width / canvas.height;
  let drawWidth = size;
  let drawHeight = size;
  let offsetX = 0;
  let offsetY = 0;

  if (aspect > 1) {
    drawHeight = size / aspect;
    offsetY = (size - drawHeight) / 2;
  } else {
    drawWidth = size * aspect;
    offsetX = (size - drawWidth) / 2;
  }

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(canvas, offsetX, offsetY, drawWidth, drawHeight);

  return thumbnail.toDataURL('image/png', 0.7);
}
