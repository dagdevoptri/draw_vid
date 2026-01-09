# Quick Deploy Guide

## 🚀 Fastest Way to Get Running

### Step 1: Create Telegram Bot (2 minutes)

1. Open Telegram, message [@BotFather](https://t.me/BotFather)
2. Send `/newbot`
3. Choose a name and username
4. **Copy the bot token** (looks like `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

### Step 2: Local Testing (5 minutes)

```bash
# Install dependencies
npm install
cd server && npm install && cd ..

# Build frontend
npm run build

# Setup server
cd server
cp .env.example .env
# Edit .env and add your BOT_TOKEN
# Set WEBAPP_URL=http://localhost:3000 (for local testing)

# Start server (serves both API and frontend)
npm start
```

### Step 3: Test Locally

1. Open `http://localhost:3001` in browser
2. Draw something
3. Click Submit
4. Check server console for received drawing

### Step 4: Deploy to Production

#### Option A: Railway (Easiest)

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Connect your repo
4. Add environment variables:
   ```
   BOT_TOKEN=your_token_here
   WEBAPP_URL=https://your-app.up.railway.app
   PORT=3001
   NODE_ENV=production
   ```
5. Set build command: `npm install && npm run build && cd server && npm install`
6. Set start command: `cd server && npm start`
7. Deploy!

#### Option B: Render

1. Go to [render.com](https://render.com)
2. New Web Service → Connect GitHub
3. Same settings as Railway above
4. Deploy!

### Step 5: Update Bot WebApp URL

1. Get your deployed URL (e.g., `https://your-app.up.railway.app`)
2. Message [@BotFather](https://t.me/BotFather)
3. Send `/newapp`
4. Select your bot
5. Provide the deployed URL as WebApp URL
6. Update `WEBAPP_URL` in your server environment variables

### Step 6: Test in Telegram

1. Open Telegram
2. Find your bot
3. Send `/start`
4. Click "🎨 Open Drawing App"
5. Draw and submit!

## ✅ Verification Checklist

- [ ] Bot responds to `/start`
- [ ] Mini App opens when clicking button
- [ ] Can draw in the app
- [ ] Submit button works
- [ ] Server receives drawing data
- [ ] Bot sends confirmation message

## 🐛 Troubleshooting

**Bot not responding?**
- Check bot token is correct in `.env`
- Verify server is running: `pm2 status` or check logs

**Mini App not opening?**
- URL must be HTTPS (Telegram requirement)
- Check browser console for errors
- Verify WebApp URL in BotFather matches deployment URL

**API errors?**
- Check server logs
- Verify `WEBAPP_URL` matches your deployment
- In development, you can set `SKIP_AUTH=true` in `.env`

## 📝 Next Steps

After deployment:
1. Add database for storing drawings
2. Set up AI processing pipeline
3. Add user notifications when videos are ready
4. Monitor usage and performance

For detailed guides, see:
- `SERVER_SETUP.md` - Complete server setup
- `DEPLOYMENT.md` - Detailed deployment options
