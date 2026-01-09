/**
 * SavedView Component
 * Beautiful confirmation screen after saving a drawing
 * Shows saved image and submit button
 */

import { useEffect, useRef, useState } from 'react';
import { useDrawingStore } from '../store/drawingStore';
import { uploadDrawingSession } from '../api/client';
import { hapticFeedback, showAlert } from '../utils/telegram';
import { createTONInvoice, openPaymentInvoice } from '../utils/payment';

interface SavedViewProps {
  savedImage: string; // Base64 thumbnail
  onBack: () => void;
  onNewDrawing: () => void;
}

export function SavedView({ savedImage, onBack, onNewDrawing }: SavedViewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getSessionData } = useDrawingStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { canvasSize, strokes } = useDrawingStore();

  // Render the full drawing on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvasSize.w;
    canvas.height = canvasSize.h;

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
  }, []);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    hapticFeedback('impact');

    try {
      const sessionData = getSessionData();

      // Create TON invoice
      const invoiceUrl = await createTONInvoice({
        sessionId: sessionData.sessionId,
        amount: 1, // 1 TON
        title: 'Submit Drawing',
        description: 'Submit your drawing for processing',
        type: 'submit',
      });

      // Open payment dialog
      openPaymentInvoice(
        invoiceUrl,
        async () => {
          // Payment successful, submit the drawing
          try {
            const result = await uploadDrawingSession(sessionData);

            if (result.success) {
              hapticFeedback('notification');
              showAlert('Drawing submitted successfully! 🎉');
            } else {
              showAlert(`Error: ${result.error || 'Failed to submit'}`);
            }
          } catch (error) {
            showAlert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          } finally {
            setIsSubmitting(false);
          }
        },
        (error) => {
          setIsSubmitting(false);
          showAlert(error);
        }
      );
    } catch (error) {
      setIsSubmitting(false);
      showAlert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col items-center justify-center p-4">
      {/* Success Animation */}
      <div className="mb-6 animate-bounce">
        <div className="text-8xl">✅</div>
      </div>

      {/* Success Message */}
      <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
        Drawing Saved!
      </h2>
      <p className="text-gray-600 mb-8 text-center">
        Your masterpiece has been saved successfully
      </p>

      {/* Saved Image Preview */}
      <div className="bg-white rounded-2xl shadow-2xl p-4 mb-8 max-w-md w-full">
        <div className="relative rounded-lg overflow-hidden bg-gray-100">
          <img
            src={savedImage}
            alt="Saved drawing"
            className="w-full h-auto object-contain"
          />
          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            💾 Saved
          </div>
        </div>
      </div>

      {/* Hidden canvas for full resolution rendering */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-md">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full px-6 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg ${
            isSubmitting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95 shadow-blue-200'
          }`}
        >
          {isSubmitting ? '⏳ Processing...' : '💎 Submit (1 TON)'}
        </button>

        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
          >
            ← Back to Drawing
          </button>
          <button
            onClick={onNewDrawing}
            className="flex-1 px-6 py-3 rounded-xl font-semibold bg-green-500 text-white hover:bg-green-600 transition-all"
          >
            🎨 New Drawing
          </button>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 text-6xl opacity-10">🎨</div>
      <div className="absolute bottom-10 right-10 text-6xl opacity-10">✨</div>
    </div>
  );
}
