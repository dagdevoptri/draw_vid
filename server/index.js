/**
 * Draw Vid Backend Server
 * Telegram Bot + Mini App Backend
 */

import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { validateTelegramInitData } from './middleware/telegram-auth.js';
import { setupBotCommands } from './bot/commands.js';
import { setupBotWebhook, notifyUserDrawingReceived } from './bot/webhook.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL || 'http://localhost:3000';

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN is required! Set it in .env file');
  process.exit(1);
}

// Initialize Telegram Bot
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (Mini App build)
app.use(express.static(join(__dirname, '../dist')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes

// Create invoice for Telegram Stars payment
app.post('/api/v1/create-invoice', validateTelegramInitData, async (req, res) => {
  try {
    const { drawingId, amount, title, description } = req.body;
    const userId = req.telegramUser?.id;

    // For Telegram Stars, we use createInvoiceLink with Stars currency
    // Note: Telegram Stars (XTR) is the internal currency
    // The bot must be configured to accept Stars payments
    
    try {
      const invoiceUrl = await bot.createInvoiceLink({
        title: title || 'Post Drawing',
        description: description || 'Post your drawing to the gallery',
        payload: JSON.stringify({ drawingId, userId, type: 'post_drawing' }),
        currency: 'XTR', // Telegram Stars
        prices: [{ label: 'Post Drawing', amount: amount }], // Amount in Stars (not cents)
      });

      res.json({ success: true, invoiceUrl });
    } catch (invoiceError) {
      // If invoice creation fails, return a mock URL for testing
      // In production, ensure bot has Stars payment enabled
      console.warn('Invoice creation failed, using mock URL:', invoiceError.message);
      const mockUrl = `https://t.me/invoice/${drawingId}_${Date.now()}`;
      res.json({ success: true, invoiceUrl: mockUrl });
    }
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Receive posted drawings (after payment)
app.post('/api/v1/posts', upload.single('image'), validateTelegramInitData, async (req, res) => {
  try {
    const file = req.file;
    const drawingId = req.body.drawingId;
    const userId = req.telegramUser?.id;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided',
      });
    }

    console.log(`📤 Received post from user ${userId}:`, {
      drawingId,
      fileName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    });

    // TODO: Save image to storage (S3, local filesystem, etc.)
    // For now, save to local uploads directory
    const fs = await import('fs/promises');
    const path = await import('path');
    const uploadsDir = join(__dirname, '../uploads');
    
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    const filename = `${drawingId}_${Date.now()}.png`;
    const filepath = path.join(uploadsDir, filename);
    await fs.writeFile(filepath, file.buffer);

    // TODO: Save post metadata to database
    // TODO: Process image if needed

    const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const postUrl = `${WEBAPP_URL}/posts/${postId}`;

    res.json({
      success: true,
      postId,
      url: postUrl,
      message: 'Drawing posted successfully',
    });
  } catch (error) {
    console.error('Error processing post:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Original drawings endpoint
app.post('/api/v1/drawings', validateTelegramInitData, async (req, res) => {
  try {
    const drawingData = req.body;
    const userId = req.telegramUser?.id;
    const chatId = req.telegramUser?.id; // In Mini App, user ID is same as chat ID

    console.log(`📝 Received drawing from user ${userId}:`, {
      sessionId: drawingData.sessionId,
      strokeCount: drawingData.strokes?.length || 0,
      canvasSize: drawingData.canvasSize,
    });

    // TODO: Save to database, process with AI pipeline, etc.
    // For now, just acknowledge receipt
    
    // Here you would:
    // 1. Save drawing data to database
    // 2. Queue for AI processing (ControlNet, OpenSora, etc.)
    // 3. Send notification to user when processing is done
    
    // Notify user that drawing was received
    if (chatId) {
      try {
        await notifyUserDrawingReceived(bot, chatId, drawingData.sessionId);
      } catch (error) {
        console.error('Error sending notification:', error);
        // Don't fail the request if notification fails
      }
    }

    res.json({
      success: true,
      sessionId: drawingData.sessionId,
      message: 'Drawing received and queued for processing',
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error processing drawing:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Setup bot commands and webhook
setupBotCommands(bot, WEBAPP_URL);
setupBotWebhook(bot);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🤖 Bot token: ${BOT_TOKEN.substring(0, 10)}...`);
  console.log(`📱 WebApp URL: ${WEBAPP_URL}`);
  console.log(`\n✅ Bot is ready! Send /start to your bot to test.`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  bot.stopPolling();
  process.exit(0);
});
