/**
 * DrawingPreview Component
 * Full-screen preview of a saved drawing
 */

import { useEffect, useRef } from 'react';
import type { SavedDrawing } from '../utils/storage';
import { useDrawingStore } from '../store/drawingStore';

interface DrawingPreviewProps {
  drawing: SavedDrawing;
  onClose: () => void;
}

export function DrawingPreview({ drawing, onClose }: DrawingPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { canvasSize } = useDrawingStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match drawing
    const { strokes } = drawing.session;
    canvas.width = drawing.session.canvasSize.w;
    canvas.height = drawing.session.canvasSize.h;

    // Scale for display (fit to screen)
    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.7;
    const scale = Math.min(
      maxWidth / canvas.width,
      maxHeight / canvas.height,
      1
    );

    canvas.style.width = `${canvas.width * scale}px`;
    canvas.style.height = `${canvas.height * scale}px`;

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render all strokes
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
  }, [drawing]);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{drawing.name}</h3>
            <p className="text-sm text-gray-500">
              {new Date(drawing.savedAt).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ✕ Close
          </button>
        </div>

        {/* Canvas Preview */}
        <div className="p-6 flex items-center justify-center bg-gray-50">
          <canvas
            ref={canvasRef}
            className="bg-white rounded-lg shadow-lg"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>

        {/* Info */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Strokes:</span>
              <span className="ml-2 font-semibold text-gray-800">
                {drawing.session.strokes.length}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Canvas Size:</span>
              <span className="ml-2 font-semibold text-gray-800">
                {drawing.session.canvasSize.w} × {drawing.session.canvasSize.h}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
