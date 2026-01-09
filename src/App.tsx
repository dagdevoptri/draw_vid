/**
 * Main App Component
 * Telegram Mini App - Drawing Input Frontend
 */

import { useEffect, useState } from 'react';
import { DrawingCanvas } from './components/DrawingCanvas';
import { Toolbar } from './components/Toolbar';
import { Gallery } from './components/Gallery';
import { SavedView } from './components/SavedView';
import { DebugPanel } from './components/DebugPanel';
import { useDrawingStore } from './store/drawingStore';
import { initTelegramWebApp, getTelegramUser } from './utils/telegram';

function App() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [showGallery, setShowGallery] = useState(false);
  const [savedImage, setSavedImage] = useState<string | null>(null);
  const { setUserId, clear } = useDrawingStore();

  useEffect(() => {
    // Initialize Telegram WebApp
    initTelegramWebApp();

    // Get user ID from Telegram
    const user = getTelegramUser();
    if (user) {
      setUserId(user.id.toString());
    }

    // Calculate canvas dimensions (full viewport minus toolbar)
    const updateDimensions = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      // Reserve space for toolbar (approximately 200px)
      const toolbarHeight = 200;
      setDimensions({
        width: vw,
        height: vh - toolbarHeight,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('orientationchange', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
    };
  }, [setUserId]);

  if (dimensions.width === 0 || dimensions.height === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Show saved view if image was just saved
  if (savedImage) {
    return (
      <SavedView
        savedImage={savedImage}
        onBack={() => setSavedImage(null)}
        onNewDrawing={() => {
          clear();
          setSavedImage(null);
        }}
      />
    );
  }

  // Show gallery if requested
  if (showGallery) {
    return <Gallery onBack={() => setShowGallery(false)} />;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-4 z-10 safe-area-inset-top">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowGallery(true)}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
          >
            📁 Gallery
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-800">
              Draw Vid - Drawing Input
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Vector-first, time-aware drawing capture
            </p>
          </div>
          <div className="w-20"></div> {/* Spacer */}
        </div>
      </div>

      {/* Canvas Container */}
      <div
        className="absolute top-16 bottom-0 left-0 right-0"
        style={{ paddingBottom: '200px' }}
      >
        <DrawingCanvas
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full"
        />
      </div>

      {/* Debug Panel (development only) */}
      {import.meta.env.DEV && <DebugPanel />}

      {/* Toolbar (includes Save button) */}
      <Toolbar onSave={(thumbnail) => setSavedImage(thumbnail)} />
    </div>
  );
}

export default App;

