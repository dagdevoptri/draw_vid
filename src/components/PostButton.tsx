/**
 * PostButton Component
 * Handles Telegram Stars payment and posting
 */

import { useState } from 'react';
import type { SavedDrawing } from '../utils/storage';
import { hapticFeedback, showAlert } from '../utils/telegram';
import { postDrawing } from '../api/posting';
import { createTONInvoice, openPaymentInvoice } from '../utils/payment';

interface PostButtonProps {
  drawing: SavedDrawing;
}

const POST_PRICE_TON = 1; // Price in TON (1 TON = 1,000,000,000 nanotons)

export function PostButton({ drawing }: PostButtonProps) {
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (isPosting) return;

    setIsPosting(true);
    hapticFeedback('impact');

    try {
      // Create TON invoice
      const invoiceUrl = await createTONInvoice({
        drawingId: drawing.id,
        amount: POST_PRICE_TON,
        title: `Post Drawing: ${drawing.name}`,
        description: 'Post your drawing to the gallery',
        type: 'post',
      });

      // Open payment dialog
      openPaymentInvoice(
        invoiceUrl,
        () => {
          // Payment successful, post the drawing
          performPost(drawing);
        },
        (error) => {
          setIsPosting(false);
          showAlert(error);
        }
      );
    } catch (error) {
      setIsPosting(false);
      showAlert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
      {isPosting ? '⏳ Posting...' : `💎 Post (${POST_PRICE_TON} TON)`}
    </button>
  );
}
