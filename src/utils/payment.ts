/**
 * Payment utilities for Telegram TON payments
 */

const TON_TO_NANOTON = 1_000_000_000; // 1 TON = 1 billion nanotons

/**
 * Convert TON to nanotons (for Telegram API)
 */
export function tonToNanoton(ton: number): number {
  return ton * TON_TO_NANOTON;
}

/**
 * Create invoice for TON payment
 */
export async function createTONInvoice(params: {
  drawingId?: string;
  sessionId?: string;
  amount: number; // Amount in TON
  title: string;
  description: string;
  type: 'post' | 'submit';
}): Promise<string> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
  
  const response = await fetch(`${API_BASE_URL}/api/v1/create-invoice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...params,
      currency: 'TON',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create invoice: ${errorText || response.statusText}`);
  }

  const data = await response.json();
  return data.invoiceUrl;
}

/**
 * Open Telegram payment invoice
 */
export function openPaymentInvoice(
  invoiceUrl: string,
  onSuccess: () => void,
  onError: (error: string) => void
): void {
  const webApp = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;

  if (!webApp?.openInvoice) {
    // Fallback for development
    console.warn('Telegram payment API not available - using mock payment');
    console.log('Invoice URL:', invoiceUrl);
    const confirmed = confirm('💰 Simulate TON payment? (Development mode)\n\nClick OK to simulate successful payment.');
    if (confirmed) {
      setTimeout(onSuccess, 500);
    } else {
      onError('Payment cancelled');
    }
    return;
  }

  console.log('Opening Telegram payment invoice:', invoiceUrl);
  webApp.openInvoice(invoiceUrl, (status) => {
    console.log('Payment status:', status);
    if (status === 'paid') {
      onSuccess();
    } else if (status === 'cancelled') {
      onError('Payment cancelled');
    } else {
      onError('Payment failed');
    }
  });
}
