/**
 * Telegram Bot Commands
 * Handles bot commands and sets up Mini App button
 */

export function setupBotCommands(bot, webappUrl) {
  // Start command
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name;

    bot.sendMessage(chatId, `👋 Hello ${firstName}!\n\n` +
      `Welcome to Draw Vid - AI Video Drawing Tool.\n\n` +
      `Click the button below to open the drawing interface:`, {
      reply_markup: {
        inline_keyboard: [[
          {
            text: '🎨 Open Drawing App',
            web_app: { url: webappUrl }
          }
        ]]
      }
    });
  });

  // Help command
  bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, `📖 Draw Vid Help\n\n` +
      `• Use /start to open the drawing interface\n` +
      `• Draw with your finger or mouse\n` +
      `• Switch between pen and eraser tools\n` +
      `• Adjust colors and stroke width\n` +
      `• Submit your drawing for AI processing\n\n` +
      `Your drawings are processed using AI video generation models.`, {
      reply_markup: {
        inline_keyboard: [[
          {
            text: '🎨 Open Drawing App',
            web_app: { url: webappUrl }
          }
        ]]
      }
    });
  });

  // Draw command (shortcut)
  bot.onText(/\/draw/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, `🎨 Opening drawing interface...`, {
      reply_markup: {
        inline_keyboard: [[
          {
            text: '🎨 Open Drawing App',
            web_app: { url: webappUrl }
          }
        ]]
      }
    });
  });

  // Status command
  bot.onText(/\/status/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, `✅ Bot Status\n\n` +
      `• Bot is online and running\n` +
      `• WebApp URL: ${webappUrl}\n` +
      `• Server time: ${new Date().toISOString()}\n\n` +
      `Everything is working correctly! 🚀`);
  });

  // Handle callback queries (button clicks)
  bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data === 'open_app') {
      bot.answerCallbackQuery(query.id, {
        text: 'Opening drawing app...',
      });
    }
  });

  // Handle errors
  bot.on('polling_error', (error) => {
    console.error('Bot polling error:', error);
  });

  console.log('✅ Bot commands configured');
}
