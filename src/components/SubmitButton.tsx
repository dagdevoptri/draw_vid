/**
 * SubmitButton Component
 * Handles submission of drawing session to backend
 */

import { useState } from 'react';
import { useDrawingStore } from '../store/drawingStore';
import { uploadDrawingSession } from '../api/client';
import { hapticFeedback, showAlert } from '../utils/telegram';

export function SubmitButton() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getSessionData, strokes } = useDrawingStore();

  const handleSubmit = async () => {
    if (strokes.length === 0) {
      showAlert('Please draw something before submitting.');
      return;
    }

    setIsSubmitting(true);
    hapticFeedback('notification');

    try {
      const sessionData = getSessionData();
      const result = await uploadDrawingSession(sessionData);

      if (result.success) {
        hapticFeedback('notification');
        showAlert('Drawing submitted successfully!');
      } else {
        showAlert(`Error: ${result.error || 'Failed to submit'}`);
      }
    } catch (error) {
      showAlert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      onClick={handleSubmit}
      disabled={isSubmitting || strokes.length === 0}
      className={`fixed top-20 right-4 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg z-20 ${
        isSubmitting || strokes.length === 0
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
      }`}
    >
      {isSubmitting ? '⏳ Submitting...' : '📤 Submit'}
    </button>
  );
}

