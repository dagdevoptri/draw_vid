/**
 * Telegram initData validation middleware
 * Validates Telegram WebApp authentication data
 */

import crypto from 'crypto';

/**
 * Validate Telegram initData signature
 * @param {string} initData - Raw initData string from Telegram
 * @param {string} botToken - Telegram bot token
 * @returns {boolean} - True if valid
 */
export function validateInitData(initData, botToken) {
  if (!initData || !botToken) {
    return false;
  }

  try {
    // Parse initData
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');

    // Sort parameters and create data check string
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Create secret key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Compare hashes
    return calculatedHash === hash;
  } catch (error) {
    console.error('Error validating initData:', error);
    return false;
  }
}

/**
 * Parse user data from initData
 * @param {string} initData - Raw initData string
 * @returns {object|null} - User object or null
 */
export function parseUserFromInitData(initData) {
  try {
    const urlParams = new URLSearchParams(initData);
    const userStr = urlParams.get('user');
    if (!userStr) return null;
    return JSON.parse(decodeURIComponent(userStr));
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

/**
 * Express middleware to validate Telegram initData
 */
export function validateTelegramInitData(req, res, next) {
  // In development, allow bypassing auth
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_AUTH === 'true') {
    console.warn('⚠️  Skipping Telegram auth validation (development mode)');
    req.telegramUser = parseUserFromInitData(req.body.initData || '');
    return next();
  }

  const initData = req.body.initData || req.headers['x-telegram-init-data'];
  
  if (!initData) {
    return res.status(401).json({
      success: false,
      error: 'Missing Telegram initData',
    });
  }

  const botToken = process.env.BOT_TOKEN;
  if (!botToken) {
    return res.status(500).json({
      success: false,
      error: 'Server configuration error',
    });
  }

  const isValid = validateInitData(initData, botToken);
  
  if (!isValid) {
    console.warn('❌ Invalid Telegram initData:', {
      initData: initData.substring(0, 50) + '...',
      ip: req.ip,
    });
    return res.status(401).json({
      success: false,
      error: 'Invalid Telegram authentication',
    });
  }

  // Parse and attach user data
  req.telegramUser = parseUserFromInitData(initData);
  
  next();
}
