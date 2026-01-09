/**
 * API client for posting drawings
 */

import type { SavedDrawing } from '../utils/storage';
import { getInitData } from '../utils/telegram';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export interface PostResult {
  success: boolean;
  postId?: string;
  url?: string;
  error?: string;
}

/**
 * Post a drawing to the server
 */
export async function postDrawing(drawing: SavedDrawing): Promise<PostResult> {
  try {
    // Convert drawing session to image
    const imageData = await convertDrawingToImage(drawing);

    const formData = new FormData();
    formData.append('image', imageData, `${drawing.id}.png`);
    formData.append('drawingId', drawing.id);
    formData.append('sessionData', JSON.stringify(drawing.session));
    formData.append('initData', getInitData());

    const response = await fetch(`${API_BASE_URL}/api/v1/posts`, {
      method: 'POST',
      body: formData,
      headers: {
        'X-Version': '1.0.0',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    const result = await response.json();
    return {
      success: true,
      postId: result.postId,
      url: result.url,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Convert drawing session to image blob
 */
async function convertDrawingToImage(drawing: SavedDrawing): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Could not create canvas context'));
      return;
    }

    const { canvasSize, strokes } = drawing.session;
    canvas.width = canvasSize.w;
    canvas.height = canvasSize.h;

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render strokes
    strokes.forEach((stroke) => {
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
      const startPoint = stroke.points[0];
      ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);

      for (let i = 1; i < stroke.points.length; i++) {
        const point = stroke.points[i];
        const x = point.x * canvas.width;
        const y = point.y * canvas.height;

        if (i === 1) {
          ctx.lineTo(x, y);
        } else {
          const prevPoint = stroke.points[i - 1];
          const prevX = prevPoint.x * canvas.width;
          const prevY = prevPoint.y * canvas.height;
          const midX = (prevX + x) / 2;
          const midY = (prevY + y) / 2;
          ctx.quadraticCurveTo(prevX, prevY, midX, midY);
        }
      }

      ctx.stroke();
      ctx.restore();
    });

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to convert canvas to blob'));
      }
    }, 'image/png');
  });
}
