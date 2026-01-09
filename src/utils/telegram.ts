/**
 * Telegram WebApp SDK integration utilities
 * Handles initialization, authentication, and Telegram-specific features
 */

// Telegram WebApp SDK types
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        enableClosingConfirmation: () => void;
        close: () => void;
        showAlert: (message: string) => void;
        showConfirm: (message: string, callback: (confirmed: boolean) => void) => void;
        initData: string;
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
        };
        themeParams?: {
          bg_color?: string;
          text_color?: string;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        openInvoice?: (url: string, callback?: (status: string) => void) => void;
      };
    };
  }
}

// Get WebApp instance (standard Telegram Mini App approach)
function getWebApp() {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp;
  }
  // Mock for development outside Telegram environment
  return {
    ready: () => console.log('[Telegram WebApp] ready()'),
    expand: () => console.log('[Telegram WebApp] expand()'),
    enableClosingConfirmation: () => console.log('[Telegram WebApp] enableClosingConfirmation()'),
    close: () => console.log('[Telegram WebApp] close()'),
    showAlert: (msg: string) => {
      console.log('[Telegram WebApp] showAlert:', msg);
      alert(msg);
    },
    showConfirm: (msg: string, cb: (confirmed: boolean) => void) => {
      console.log('[Telegram WebApp] showConfirm:', msg);
      cb(confirm(msg));
    },
    initData: '',
    initDataUnsafe: {},
    themeParams: {},
    HapticFeedback: {
      impactOccurred: () => console.log('[Telegram WebApp] HapticFeedback.impactOccurred'),
      notificationOccurred: () => console.log('[Telegram WebApp] HapticFeedback.notificationOccurred'),
      selectionChanged: () => console.log('[Telegram WebApp] HapticFeedback.selectionChanged'),
    },
    openInvoice: (url: string, callback?: (status: string) => void) => {
      console.log('[Telegram WebApp] openInvoice:', url);
      // Mock payment - in development, simulate success
      if (callback) {
        setTimeout(() => {
          const confirmed = confirm('Simulate payment success? (Development mode)');
          callback(confirmed ? 'paid' : 'cancelled');
        }, 500);
      }
    },
  };
}

const WebApp = getWebApp();

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

/**
 * Initialize Telegram WebApp SDK
 */
export function initTelegramWebApp(): void {
  WebApp.ready();
  
  // Expand to full height
  WebApp.expand();
  
  // Enable closing confirmation
  WebApp.enableClosingConfirmation();
  
  // Set theme colors
  if (WebApp.themeParams.bg_color) {
    document.documentElement.style.setProperty(
      '--tg-theme-bg-color',
      WebApp.themeParams.bg_color
    );
  }
  if (WebApp.themeParams.text_color) {
    document.documentElement.style.setProperty(
      '--tg-theme-text-color',
      WebApp.themeParams.text_color
    );
  }
}

/**
 * Get Telegram user data
 */
export function getTelegramUser(): TelegramUser | null {
  if (!WebApp.initDataUnsafe?.user) return null;
  
  return WebApp.initDataUnsafe.user as TelegramUser;
}

/**
 * Get Telegram init data for backend validation
 */
export function getInitData(): string {
  return WebApp.initData || '';
}

/**
 * Show haptic feedback
 */
export function hapticFeedback(type: 'impact' | 'notification' | 'selection' = 'impact'): void {
  if (type === 'impact') {
    WebApp.HapticFeedback.impactOccurred('medium');
  } else if (type === 'notification') {
    WebApp.HapticFeedback.notificationOccurred('success');
  } else if (type === 'selection') {
    WebApp.HapticFeedback.selectionChanged();
  }
}

/**
 * Show Telegram alert
 */
export function showAlert(message: string): void {
  WebApp.showAlert(message);
}

/**
 * Show Telegram confirm dialog
 */
export function showConfirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    WebApp.showConfirm(message, (confirmed) => {
      resolve(confirmed);
    });
  });
}

/**
 * Close the Mini App
 */
export function closeMiniApp(): void {
  WebApp.close();
}

