/**
 * SaveButton Component
 * Saves current drawing to local storage
 */

import { useState } from 'react';
import { useDrawingStore } from '../store/drawingStore';
import { saveDrawing, generateThumbnail } from '../utils/storage';
import { hapticFeedback, showAlert } from '../utils/telegram';

export function SaveButton() {
  const [isSaving, setIsSaving] = useState(false);
  const { getSessionData, strokes } = useDrawingStore();

  const handleSave = async () => {
    if (strokes.length === 0) {
      showAlert('Please draw something before saving.');
      return;
    }

    setIsSaving(true);
    hapticFeedback('notification');

    try {
      const sessionData = getSessionData();
      
      // Generate thumbnail from canvas
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      let thumbnail: string | undefined;
      if (canvas) {
        thumbnail = generateThumbnail(canvas);
      }

      const id = saveDrawing(sessionData, thumbnail);
      
      hapticFeedback('notification');
      showAlert('Drawing saved successfully!');
      
      console.log('Drawing saved with ID:', id);
    } catch (error) {
      showAlert(`Error saving: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={isSaving || strokes.length === 0}
      className={`fixed top-20 left-4 px-4 py-2 rounded-lg font-semibold transition-all shadow-lg z-20 ${
        isSaving || strokes.length === 0
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-green-500 text-white hover:bg-green-600 active:scale-95'
      }`}
    >
      {isSaving ? '💾 Saving...' : '💾 Save'}
    </button>
  );
}
