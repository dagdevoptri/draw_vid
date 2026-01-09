# Deployment Guide

## Quick Deployment Steps

### 1. Build Frontend
```bash
npm install
npm run build
```

This creates the `dist` folder with your Mini App.

### 2. Setup Server
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your bot token and WebApp URL
```

### 3. Deploy Options

## Option A: Deploy Everything Together (Recommended)

### Using Railway

1. **Connect Repository:**
   - Go to [railway.app](https://railway.app)
   - New Project → Deploy from GitHub
   - Select your repository

2. **Configure Build:**
   - Root directory: `/`
   - Build command: `npm install && npm run build && cd server && npm install`
   - Start command: `cd server && npm start`

3. **Set Environment Variables:**
   ```
   BOT_TOKEN=your_bot_token
   WEBAPP_URL=https://your-app.up.railway.app
   PORT=3001
   NODE_ENV=production
   ```

4. **Deploy:**
   - Railway will automatically deploy
   - Get your URL from Railway dashboard
   - Update `WEBAPP_URL` in environment variables

### Using Render

1. **Create Web Service:**
   - Go to [render.com](https://render.com)
   - New → Web Service
   - Connect GitHub repository

2. **Configure:**
   - **Build Command:** `npm install && npm run build && cd server && npm install`
   - **Start Command:** `cd server && npm start`
   - **Environment:** Node

3. **Environment Variables:**
   ```
   BOT_TOKEN=your_bot_token
   WEBAPP_URL=https://your-app.onrender.com
   PORT=3001
   NODE_ENV=production
   ```

4. **Deploy:**
   - Render will build and deploy
   - Update `WEBAPP_URL` with your Render URL

## Option B: Separate Frontend & Backend

### Frontend (Static Hosting)

Deploy `dist` folder to:
- **Vercel:** `vercel --prod`
- **Netlify:** Drag `dist` folder
- **Cloudflare Pages:** Connect GitHub repo
- **GitHub Pages:** Use GitHub Actions

### Backend (Node.js Server)

Deploy `server` folder to:
- **Railway:** As shown above
- **Render:** As shown above
- **Fly.io:** See below
- **DigitalOcean App Platform**
- **Heroku** (if still available)

### Fly.io Deployment

1. **Install Fly CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Create fly.toml:**
   ```toml
   app = "draw-vid-server"
   primary_region = "iad"

   [build]
     builder = "paketobuildpacks/builder:base"

   [http_service]
     internal_port = 3001
     force_https = true
     auto_stop_machines = true
     auto_start_machines = true
     min_machines_running = 0
     processes = ["app"]

   [[vm]]
     cpu_kind = "shared"
     cpus = 1
     memory_mb = 512
   ```

3. **Deploy:**
   ```bash
   cd server
   fly launch
   fly secrets set BOT_TOKEN=your_token
   fly secrets set WEBAPP_URL=https://your-frontend.com
   fly deploy
   ```

## Option C: VPS Deployment (DigitalOcean, Linode, etc.)

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

### 2. Deploy Application

```bash
# Clone repository
git clone your-repo-url
cd draw_vid

# Build frontend
npm install
npm run build

# Setup backend
cd server
npm install
cp .env.example .env
nano .env  # Edit with your values
```

### 3. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/draw-vid
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Serve static files (Mini App)
    location / {
        root /path/to/draw_vid/dist;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3001/health;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/draw-vid /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Setup SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

### 5. Start Application

```bash
cd /path/to/draw_vid/server
pm2 start index.js --name draw-vid-server
pm2 save
pm2 startup
```

## Environment Variables

### Required
- `BOT_TOKEN` - Your Telegram bot token
- `WEBAPP_URL` - Full URL where Mini App is hosted (must be HTTPS)

### Optional
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (production/development)
- `SKIP_AUTH` - Only for local dev, NEVER in production

## Post-Deployment Checklist

- [ ] Bot responds to `/start` command
- [ ] Mini App opens when clicking button
- [ ] Can draw in Mini App
- [ ] Submit button sends data to server
- [ ] Server logs show received drawings
- [ ] HTTPS is enabled (required by Telegram)
- [ ] Environment variables are set correctly
- [ ] Server is running (check `/health` endpoint)

## Testing Deployment

### 1. Test Bot
```bash
# Send message to your bot
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/sendMessage" \
  -d "chat_id=<YOUR_CHAT_ID>" \
  -d "text=/start"
```

### 2. Test API
```bash
curl https://your-domain.com/health
```

### 3. Test Mini App
- Open Telegram
- Send `/start` to your bot
- Click "Open Drawing App" button
- Draw something
- Click Submit
- Check server logs

## Troubleshooting

### Bot not responding
- Check bot token is correct
- Verify bot is running: `pm2 status`
- Check logs: `pm2 logs draw-vid-server`

### Mini App not loading
- Verify URL is HTTPS (Telegram requirement)
- Check browser console for errors
- Verify static files are being served

### API errors
- Check CORS configuration
- Verify initData validation
- Check server logs for errors

### SSL issues
- Ensure domain points to server IP
- Verify Let's Encrypt certificate
- Check Nginx configuration

## Monitoring

### PM2 Monitoring
```bash
pm2 status
pm2 logs draw-vid-server
pm2 monit
```

### Nginx Logs
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Application Logs
Check console output for:
- Drawing submissions
- API errors
- Bot command handling

## Scaling

For high traffic:
1. Use load balancer (Nginx, Cloudflare)
2. Run multiple PM2 instances: `pm2 start index.js -i max`
3. Add Redis for session management
4. Use database for persistent storage
5. Queue system for AI processing

## Security Best Practices

- [ ] Use HTTPS everywhere
- [ ] Keep bot token secret
- [ ] Enable Telegram initData validation
- [ ] Set up rate limiting
- [ ] Monitor for abuse
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets
- [ ] Regular backups of data
