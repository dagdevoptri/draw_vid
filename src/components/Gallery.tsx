/**
 * Gallery Component
 * Displays saved drawings with post functionality
 */

import { useState, useEffect, useRef } from 'react';
import { getSavedDrawings, deleteSavedDrawing, type SavedDrawing } from '../utils/storage';
import { PostButton } from './PostButton';
import { DrawingPreview } from './DrawingPreview';
import { hapticFeedback } from '../utils/telegram';

interface GalleryProps {
  onBack: () => void;
  onSelectDrawing?: (drawing: SavedDrawing) => void;
}

export function Gallery({ onBack, onSelectDrawing }: GalleryProps) {
  const [savedDrawings, setSavedDrawings] = useState<SavedDrawing[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewDrawing, setPreviewDrawing] = useState<SavedDrawing | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const longPressTargetRef = useRef<string | null>(null);

  useEffect(() => {
    loadDrawings();
  }, []);

  const loadDrawings = () => {
    const drawings = getSavedDrawings();
    setSavedDrawings(drawings);
  };

  const handleDelete = (id: string) => {
    hapticFeedback('impact');
    if (window.confirm('Delete this drawing?')) {
      deleteSavedDrawing(id);
      loadDrawings();
      if (selectedId === id) {
        setSelectedId(null);
      }
    }
  };

  const handleLongPressStart = (drawing: SavedDrawing, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    longPressTargetRef.current = drawing.id;
    hapticFeedback('impact');
    
    longPressTimerRef.current = window.setTimeout(() => {
      if (longPressTargetRef.current === drawing.id) {
        setPreviewDrawing(drawing);
        hapticFeedback('notification');
      }
    }, 500); // 500ms long press
  };

  const handleLongPressEnd = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressTargetRef.current = null;
  };

  const handleClick = (drawing: SavedDrawing, e: React.MouseEvent | React.TouchEvent) => {
    // Only handle click if it wasn't a long press
    if (longPressTimerRef.current === null) {
      setSelectedId(drawing.id);
      if (onSelectDrawing) {
        onSelectDrawing(drawing);
      }
    }
  };

  const selectedDrawing = selectedId 
    ? savedDrawings.find(d => d.id === selectedId)
    : null;

  return (
    <>
      {/* Preview Modal */}
      {previewDrawing && (
        <DrawingPreview
          drawing={previewDrawing}
          onClose={() => setPreviewDrawing(null)}
        />
      )}

      <div className="w-full h-screen bg-gray-50 overflow-hidden">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-4 z-10 safe-area-inset-top">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              ← Back
            </button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-800">Saved Drawings</h1>
              <p className="text-xs text-gray-500 mt-1">Long press to preview</p>
            </div>
            <div className="w-20"></div> {/* Spacer */}
          </div>
        </div>

      <div className="pt-20 pb-4 px-4 h-full overflow-y-auto">
        {savedDrawings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-6xl mb-4">🎨</div>
            <p className="text-lg">No saved drawings yet</p>
            <p className="text-sm mt-2">Draw something and save it!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {savedDrawings.map((drawing) => (
              <div
                key={drawing.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden border-2 transition-all ${
                  selectedId === drawing.id
                    ? 'border-blue-500 scale-105'
                    : 'border-transparent hover:border-gray-300'
                }`}
                onMouseDown={(e) => handleLongPressStart(drawing, e)}
                onMouseUp={handleLongPressEnd}
                onMouseLeave={handleLongPressEnd}
                onTouchStart={(e) => handleLongPressStart(drawing, e)}
                onTouchEnd={handleLongPressEnd}
                onClick={(e) => handleClick(drawing, e)}
              >
                {drawing.thumbnail ? (
                  <img
                    src={drawing.thumbnail}
                    alt={drawing.name}
                    className="w-full h-48 object-contain bg-gray-100"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400">No preview</span>
                  </div>
                )}
                <div className="p-3">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {drawing.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(drawing.savedAt).toLocaleDateString()}
                  </p>
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(drawing.id);
                        }}
                        className="flex-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                    {selectedId === drawing.id && (
                      <PostButton drawing={drawing} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </>
  );
}
