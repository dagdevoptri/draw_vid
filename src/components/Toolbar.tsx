/**
 * Toolbar Component
 * UI controls for tool selection, style settings, and actions
 */

import { useState } from 'react';
import { useDrawingStore } from '../store/drawingStore';
import { hapticFeedback, showAlert } from '../utils/telegram';
import { saveDrawing, generateThumbnail } from '../utils/storage';
import type { DrawingTool } from '../types';

interface ToolbarProps {
  onSave?: (thumbnail: string) => void;
}

export function Toolbar({ onSave }: ToolbarProps) {
  const {
    tool,
    style,
    setTool,
    setStyle,
    undo,
    redo,
    clear,
    undoStack,
    redoStack,
    strokes,
    getSessionData,
  } = useDrawingStore();
  
  const [isSaving, setIsSaving] = useState(false);

  const handleToolChange = (newTool: DrawingTool) => {
    hapticFeedback('selection');
    setTool(newTool);
  };

  const handleUndo = () => {
    hapticFeedback('impact');
    undo();
  };

  const handleRedo = () => {
    hapticFeedback('impact');
    redo();
  };

  const handleClear = () => {
    hapticFeedback('impact');
    if (window.confirm('Clear all drawings?')) {
      clear();
    }
  };

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
      
      // Call onSave callback with thumbnail
      if (onSave && thumbnail) {
        onSave(thumbnail);
      } else {
        showAlert('Drawing saved successfully!');
      }
      
      console.log('Drawing saved with ID:', id);
    } catch (error) {
      showAlert(`Error saving: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 safe-area-inset-bottom">
      <div className="max-w-2xl mx-auto">
        {/* Tool Selection */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            onClick={() => handleToolChange('pen')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              tool === 'pen'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ✏️ Pen
          </button>
          <button
            onClick={() => handleToolChange('eraser')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              tool === 'eraser'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🧹 Eraser
          </button>
        </div>

        {/* Style Controls */}
        {tool !== 'eraser' && (
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Color:</label>
              <input
                type="color"
                value={style.color}
                onChange={(e) => setStyle({ color: e.target.value })}
                className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Width:</label>
              <input
                type="range"
                min="1"
                max="20"
                value={style.width}
                onChange={(e) => setStyle({ width: parseInt(e.target.value) })}
                className="w-24"
              />
              <span className="text-sm text-gray-600 w-8">{style.width}px</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className={`px-4 py-2 rounded-lg transition-colors ${
              undoStack.length === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ↶ Undo
          </button>
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className={`px-4 py-2 rounded-lg transition-colors ${
              redoStack.length === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ↷ Redo
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || strokes.length === 0}
            className={`px-4 py-2 rounded-lg transition-colors font-semibold ${
              isSaving || strokes.length === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isSaving ? '💾 Saving...' : '💾 Save'}
          </button>
          <button
            onClick={handleClear}
            disabled={strokes.length === 0}
            className={`px-4 py-2 rounded-lg transition-colors ${
              strokes.length === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            🗑️ Clear
          </button>
        </div>
      </div>
    </div>
  );
}

