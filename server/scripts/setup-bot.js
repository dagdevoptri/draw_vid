/**
 * Bot Setup Script
 * Helps configure the Telegram bot with WebApp
 */

import readline from 'readline';
import dotenv from 'dotenv';
import { writeFileSync, existsSync } from 'fs';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupBot() {
  console.log('🤖 Telegram Bot Setup\n');
  console.log('This script will help you configure your Telegram bot.\n');

  const botToken = await question('Enter your bot token (from @BotFather): ');
  if (!botToken) {
    console.error('❌ Bot token is required!');
    process.exit(1);
  }

  const webappUrl = await question('Enter your WebApp URL (e.g., https://your-domain.com): ');
  if (!webappUrl) {
    console.error('❌ WebApp URL is required!');
    process.exit(1);
  }

  const port = await question('Enter server port (default: 3001): ') || '3001';

  // Create .env file
  const envContent = `# Telegram Bot Configuration
BOT_TOKEN=${botToken}

# WebApp URL
WEBAPP_URL=${webappUrl}

# Server Configuration
PORT=${port}
NODE_ENV=production
`;

  writeFileSync('.env', envContent);
  console.log('\n✅ Configuration saved to .env file\n');

  console.log('📋 Next steps:');
  console.log('1. Make sure your Mini App is deployed at:', webappUrl);
  console.log('2. Start the server: npm start');
  console.log('3. Test by sending /start to your bot\n');

  rl.close();
}

setupBot().catch(console.error);
