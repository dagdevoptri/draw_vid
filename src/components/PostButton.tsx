/**
 * PostButton Component
 * Handles Telegram Stars payment and posting
 */

import { useState } from 'react';
import type { SavedDrawing } from '../utils/storage';
import { hapticFeedback, showAlert } from '../utils/telegram';
import { postDrawing } from '../api/posting';

interface PostButtonProps {
  drawing: SavedDrawing;
}

const POST_PRICE_STARS = 10; // Price in Telegram Stars

export function PostButton({ drawing }: PostButtonProps) {
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (isPosting) return;

    setIsPosting(true);
    hapticFeedback('impact');

    try {
      // Check if Telegram Stars API is available
      const webApp = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
      
      if (webApp?.openInvoice) {
        // Create invoice and open payment
        const invoiceUrl = await createInvoice(drawing);
        
        webApp.openInvoice(invoiceUrl, (status) => {
          if (status === 'paid') {
            // Payment successful, post the drawing
            performPost(drawing);
          } else {
            setIsPosting(false);
            if (status === 'cancelled') {
              showAlert('Payment cancelled');
            } else {
              showAlert('Payment failed');
            }
          }
        });
      } else {
        // Fallback: Direct post without payment (for testing/development)
        console.warn('Telegram Stars API not available, posting directly');
        await performPost(drawing);
      }
    } catch (error) {
      setIsPosting(false);
      showAlert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const createInvoice = async (drawing: SavedDrawing): Promise<string> => {
    // In production, create invoice on backend
    // For now, return a mock invoice URL
    // Backend should create invoice via Telegram Bot API
    const response = await fetch('/api/v1/create-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        drawingId: drawing.id,
        amount: POST_PRICE_STARS,
        title: `Post Drawing: ${drawing.name}`,
        description: 'Post your drawing to the gallery',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create invoice');
    }

    const data = await response.json();
    return data.invoiceUrl;
  };

  const performPost = async (drawing: SavedDrawing) => {
    try {
      const result = await postDrawing(drawing);
      
      if (result.success) {
        hapticFeedback('notification');
        showAlert('Drawing posted successfully! 🎉');
        setIsPosting(false);
      } else {
        throw new Error(result.error || 'Failed to post');
      }
    } catch (error) {
      setIsPosting(false);
      throw error;
    }
  };

  return (
    <button
      onClick={handlePost}
      disabled={isPosting}
      className={`w-full px-3 py-2 rounded text-sm font-semibold transition-all ${
        isPosting
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
      }`}
    >
      {isPosting ? '⏳ Posting...' : `⭐ Post (${POST_PRICE_STARS} Stars)`}
    </button>
  );
}
