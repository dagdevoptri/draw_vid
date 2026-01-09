# Server Setup Guide

## Quick Start

### 1. Create Telegram Bot

1. Open Telegram and message [@BotFather](https://t.me/BotFather)
2. Send `/newbot`
3. Follow the prompts to create your bot
4. **Save your bot token** (you'll need it)

### 2. Configure WebApp (Optional but Recommended)

1. Send `/newapp` to BotFather
2. Select your bot
3. Provide:
   - **App title**: Draw Vid
   - **App description**: AI-powered drawing to video tool
   - **App URL**: Your deployed Mini App URL (e.g., `https://your-domain.com`)
   - **App icon**: (optional) Upload an icon
4. BotFather will provide a WebApp button

**Note**: You can also use inline keyboard buttons (already configured in the code).

### 3. Install Server Dependencies

```bash
cd server
npm install
```

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` file:
```env
BOT_TOKEN=your_bot_token_here
WEBAPP_URL=https://your-domain.com
PORT=3001
NODE_ENV=production
```

Or use the setup script:
```bash
npm run setup-bot
```

### 5. Build Frontend

```bash
# From project root
npm run build
```

This creates the `dist` folder that the server will serve.

### 6. Start Server

```bash
cd server
npm start
```

For development with auto-reload:
```bash
npm run dev
```

### 7. Test Bot

1. Open Telegram
2. Find your bot (search for the username you created)
3. Send `/start`
4. Click the "🎨 Open Drawing App" button
5. The Mini App should open!

## Server Architecture

```
server/
├── index.js              # Main server file
├── middleware/
│   └── telegram-auth.js  # Telegram initData validation
├── bot/
│   ├── commands.js       # Bot command handlers
│   └── webhook.js        # Webhook handlers
└── scripts/
    └── setup-bot.js      # Setup helper script
```

## API Endpoints

### POST `/api/v1/drawings`
Receives drawing data from Mini App.

**Headers:**
- `Content-Type: application/json`

**Body:**
```json
{
  "sessionId": "session_...",
  "userId": "123456789",
  "canvasSize": { "w": 1080, "h": 1920 },
  "strokes": [...],
  "intent": { "action": "none" },
  "initData": "query_id=...&user=..."
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "session_...",
  "message": "Drawing received and queued for processing",
  "timestamp": 1234567890
}
```

### GET `/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Bot Commands

- `/start` - Start the bot and show Mini App button
- `/help` - Show help message
- `/draw` - Quick shortcut to open drawing app
- `/status` - Check bot status

## Deployment

### Option 1: Simple VPS (DigitalOcean, Linode, etc.)

1. **Install Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Clone and setup:**
   ```bash
   git clone your-repo
   cd draw_vid
   npm install
   npm run build
   cd server
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   nano .env  # Edit with your values
   ```

4. **Run with PM2:**
   ```bash
   npm install -g pm2
   pm2 start index.js --name draw-vid-server
   pm2 save
   pm2 startup
   ```

5. **Setup Nginx reverse proxy** (optional but recommended):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Option 2: Railway / Render / Fly.io

1. **Railway:**
   - Connect GitHub repo
   - Set environment variables
   - Deploy

2. **Render:**
   - Create new Web Service
   - Connect repo
   - Set build command: `npm install && npm run build && cd server && npm install`
   - Set start command: `cd server && npm start`
   - Add environment variables

3. **Fly.io:**
   ```bash
   fly launch
   fly secrets set BOT_TOKEN=your_token
   fly secrets set WEBAPP_URL=https://your-app.fly.dev
   fly deploy
   ```

## Security

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Remove `SKIP_AUTH` from environment
- [ ] Use HTTPS for WebApp URL
- [ ] Keep bot token secret (never commit to git)
- [ ] Enable Telegram initData validation
- [ ] Use reverse proxy (Nginx) with SSL
- [ ] Set up rate limiting
- [ ] Monitor logs for suspicious activity

### Telegram initData Validation

The server validates all requests using Telegram's initData signature. This ensures:
- Requests come from legitimate Telegram users
- User data cannot be spoofed
- Session integrity is maintained

## Troubleshooting

### Bot not responding
- Check bot token is correct
- Verify bot is not stopped in BotFather
- Check server logs for errors

### Mini App not opening
- Verify WebApp URL is accessible
- Check URL is HTTPS (required by Telegram)
- Verify bot has WebApp configured

### API errors
- Check initData validation is working
- Verify CORS is configured correctly
- Check request payload structure

### Drawing not submitting
- Check browser console for errors
- Verify API endpoint URL is correct
- Check network tab for request/response

## Next Steps

After setup, you can:
1. **Add database** (PostgreSQL, MongoDB) to store drawings
2. **Queue system** (Redis, Bull) for AI processing
3. **Video processing** pipeline (FFmpeg, OpenSora)
4. **User notifications** when videos are ready
5. **Analytics** and usage tracking

## Support

For issues or questions:
- Check server logs: `pm2 logs draw-vid-server`
- Test API endpoint: `curl http://localhost:3001/health`
- Verify bot: Send `/status` to your bot
