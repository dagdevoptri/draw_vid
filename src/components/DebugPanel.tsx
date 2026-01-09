/**
 * DebugPanel Component
 * Development tool for inspecting drawing state and data
 */

import { useState } from 'react';
import { useDrawingStore } from '../store/drawingStore';

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const store = useDrawingStore();

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-50 hover:opacity-100 z-50"
      >
        🔍 Debug
      </button>
    );
  }

  const sessionData = store.getSessionData();
  const totalPoints = store.strokes.reduce((sum, stroke) => sum + stroke.points.length, 0);

  return (
    <div className="fixed top-4 left-4 bg-white border-2 border-gray-300 rounded-lg shadow-xl p-4 z-50 max-w-md max-h-[80vh] overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Debug Panel</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4 text-sm">
        {/* Session Info */}
        <div>
          <h4 className="font-semibold mb-2">Session Info</h4>
          <div className="bg-gray-50 p-2 rounded text-xs font-mono">
            <div>Session ID: {sessionData.sessionId}</div>
            <div>User ID: {sessionData.userId || '(not set)'}</div>
            <div>Start Time: {new Date(sessionData.startTime).toLocaleTimeString()}</div>
            <div>Version: {sessionData.version}</div>
          </div>
        </div>

        {/* Canvas Info */}
        <div>
          <h4 className="font-semibold mb-2">Canvas</h4>
          <div className="bg-gray-50 p-2 rounded text-xs">
            <div>Size: {store.canvasSize.w} × {store.canvasSize.h}</div>
            <div>Tool: {store.tool}</div>
            <div>Color: {store.style.color}</div>
            <div>Width: {store.style.width}px</div>
            <div>Opacity: {store.style.opacity}</div>
          </div>
        </div>

        {/* Strokes Info */}
        <div>
          <h4 className="font-semibold mb-2">Strokes</h4>
          <div className="bg-gray-50 p-2 rounded text-xs">
            <div>Total Strokes: {store.strokes.length}</div>
            <div>Total Points: {totalPoints}</div>
            <div>Current Stroke: {store.currentStroke ? 'Yes' : 'No'}</div>
            <div>Is Drawing: {store.isDrawing ? 'Yes' : 'No'}</div>
            <div>Undo Stack: {store.undoStack.length}</div>
            <div>Redo Stack: {store.redoStack.length}</div>
          </div>
        </div>

        {/* Intent */}
        <div>
          <h4 className="font-semibold mb-2">Intent</h4>
          <div className="bg-gray-50 p-2 rounded text-xs">
            <div>Action: {store.intent.action}</div>
            {store.intent.text && <div>Text: {store.intent.text}</div>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              console.log('Session Data:', sessionData);
              console.log('Store State:', store);
            }}
            className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
          >
            Log to Console
          </button>
          <button
            onClick={() => {
              const data = JSON.stringify(sessionData, null, 2);
              navigator.clipboard.writeText(data);
              alert('Session data copied to clipboard!');
            }}
            className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
          >
            Copy JSON
          </button>
          <button
            onClick={() => {
              const data = JSON.stringify(sessionData, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `drawing-session-${Date.now()}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600"
          >
            Download JSON
          </button>
        </div>

        {/* Recent Strokes Preview */}
        {store.strokes.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Recent Strokes</h4>
            <div className="bg-gray-50 p-2 rounded text-xs max-h-40 overflow-auto">
              {store.strokes.slice(-3).map((stroke) => (
                <div key={stroke.strokeId} className="mb-2 border-b border-gray-200 pb-2">
                  <div className="font-mono text-xs">
                    <div>ID: {stroke.strokeId.substring(0, 20)}...</div>
                    <div>Tool: {stroke.tool}</div>
                    <div>Points: {stroke.points.length}</div>
                    <div>Duration: {stroke.endTime - stroke.startTime}ms</div>
                    <div>Color: {stroke.style.color}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
