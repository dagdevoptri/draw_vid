/**
 * Telegram Bot Webhook Handler
 * Handles webhook events and user notifications
 */

export function setupBotWebhook(bot) {
  console.log('✅ Bot webhook handlers configured');
}

/**
 * Notify user that drawing was received
 */
export async function notifyUserDrawingReceived(bot, chatId, sessionId) {
  try {
    await bot.sendMessage(chatId, 
      `✅ Your drawing has been received!\n\n` +
      `Session ID: \`${sessionId}\`\n` +
      `Processing will begin shortly...\n\n` +
      `You'll be notified when it's ready! 🎬`,
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

/**
 * Notify user that video is ready
 */
export async function notifyUserDrawingReady(bot, chatId, sessionId, videoUrl) {
  try {
    await bot.sendMessage(chatId,
      `🎉 Your video is ready!\n\n` +
      `Session ID: \`${sessionId}\`\n\n` +
      `[Watch Video](${videoUrl})`,
      { 
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            {
              text: '🎬 Watch Video',
              url: videoUrl
            },
            {
              text: '🎨 Draw Again',
              web_app: { url: process.env.WEBAPP_URL }
            }
          ]]
        }
      }
    );
  } catch (error) {
    console.error('Error sending video notification:', error);
  }
}
