# Complete Deployment Guide: Nginx + Domain Setup for Telegram

This guide walks you through deploying the Draw Vid app on a VPS with Nginx, setting up a domain, and configuring it for Telegram Mini Apps.

## Prerequisites

- VPS with Ubuntu 20.04+ (DigitalOcean, Linode, AWS EC2, etc.)
- Domain name (e.g., from Namecheap, GoDaddy, Cloudflare)
- SSH access to your server
- Basic terminal knowledge

## Step 1: Server Setup

### 1.1 Connect to Your Server

```bash
ssh root@your-server-ip
```

### 1.2 Update System

```bash
apt update && apt upgrade -y
```

### 1.3 Install Node.js

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version
```

### 1.4 Install PM2 (Process Manager)

```bash
npm install -g pm2
```

### 1.5 Install Nginx

```bash
apt install nginx -y
systemctl start nginx
systemctl enable nginx
```

## Step 2: Domain Configuration

### 2.1 Point Domain to Server

1. Go to your domain registrar (Namecheap, GoDaddy, etc.)
2. Find DNS settings
3. Add an **A Record**:
   - **Host**: `@` or `yourdomain.com`
   - **Value**: Your server's IP address
   - **TTL**: 3600 (or default)

4. (Optional) Add subdomain:
   - **Host**: `api` or `app`
   - **Value**: Your server's IP address

**Wait 5-30 minutes** for DNS to propagate. Check with:
```bash
dig yourdomain.com
# or
nslookup yourdomain.com
```

### 2.2 Verify Domain Points to Server

```bash
# Should return your server IP
host yourdomain.com
```

## Step 3: Deploy Application

### 3.1 Clone Repository

```bash
cd /var/www
git clone your-repository-url draw-vid
cd draw-vid
```

Or upload files via SCP:
```bash
# From your local machine
scp -r /path/to/draw_vid root@your-server-ip:/var/www/
```

### 3.2 Install Dependencies

```bash
# Install frontend dependencies
npm install

# Build frontend
npm run build

# Install backend dependencies
cd server
npm install
```

### 3.3 Configure Environment

```bash
cd server
cp .env.example .env
nano .env
```

Edit `.env`:
```env
BOT_TOKEN=your_telegram_bot_token_here
WEBAPP_URL=https://yourdomain.com
PORT=3001
NODE_ENV=production
```

### 3.4 Create Uploads Directory

```bash
mkdir -p /var/www/draw-vid/uploads
chmod 755 /var/www/draw-vid/uploads
```

### 3.5 Start Application with PM2

```bash
cd /var/www/draw-vid/server
pm2 start index.js --name draw-vid-server
pm2 save
pm2 startup
```

Verify it's running:
```bash
pm2 status
pm2 logs draw-vid-server
```

## Step 4: Configure Nginx

### 4.1 Create Nginx Configuration

```bash
nano /etc/nginx/sites-available/draw-vid
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (will be set up in next step)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Increase upload size for images
    client_max_body_size 10M;

    # Serve static files (Mini App)
    root /var/www/draw-vid/dist;
    index index.html;

    # Main location - serve Mini App
    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API endpoints - proxy to Node.js server
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
        
        # Increase timeouts for file uploads
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }

    # Serve uploaded images
    location /uploads {
        alias /var/www/draw-vid/uploads;
        expires 30d;
        add_header Cache-Control "public";
    }

    # Logging
    access_log /var/log/nginx/draw-vid-access.log;
    error_log /var/log/nginx/draw-vid-error.log;
}
```

**Important**: Replace `yourdomain.com` with your actual domain!

### 4.2 Enable Site

```bash
ln -s /etc/nginx/sites-available/draw-vid /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default  # Remove default site
nginx -t  # Test configuration
```

### 4.3 Install SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts:
# - Enter email
# - Agree to terms
# - Choose redirect HTTP to HTTPS (option 2)
```

Certbot will automatically update your Nginx config with SSL settings.

### 4.4 Reload Nginx

```bash
systemctl reload nginx
systemctl status nginx
```

## Step 5: Configure Telegram Bot

### 5.1 Set WebApp URL in BotFather

1. Open Telegram, message [@BotFather](https://t.me/BotFather)
2. Send `/newapp` or `/myapps`
3. Select your bot
4. Provide:
   - **App URL**: `https://yourdomain.com`
   - **App title**: Draw Vid
   - **App description**: AI-powered drawing to video tool

### 5.2 Test Bot

1. Send `/start` to your bot
2. Click "🎨 Open Drawing App" button
3. Mini App should open at `https://yourdomain.com`

## Step 6: Firewall Configuration

```bash
# Allow SSH (important - do this first!)
ufw allow 22/tcp

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw enable

# Check status
ufw status
```

## Step 7: Verify Deployment

### 7.1 Test Endpoints

```bash
# Health check
curl https://yourdomain.com/health

# Should return: {"status":"ok","timestamp":"..."}
```

### 7.2 Test in Browser

1. Open `https://yourdomain.com`
2. Should see the drawing app
3. Draw something
4. Click Save
5. Click Gallery
6. Click Post (will test payment flow)

### 7.3 Test in Telegram

1. Open your bot
2. Send `/start`
3. Click Mini App button
4. Verify it loads correctly

## Step 8: Monitoring & Maintenance

### 8.1 View Logs

```bash
# Application logs
pm2 logs draw-vid-server

# Nginx logs
tail -f /var/log/nginx/draw-vid-access.log
tail -f /var/log/nginx/draw-vid-error.log

# System logs
journalctl -u nginx -f
```

### 8.2 Monitor Resources

```bash
# PM2 monitoring
pm2 monit

# System resources
htop
```

### 8.3 Auto-restart on Reboot

PM2 startup should already be configured. Verify:
```bash
pm2 startup
# Follow the command it outputs if needed
```

### 8.4 Update Application

```bash
cd /var/www/draw-vid
git pull  # or upload new files
npm install
npm run build
pm2 restart draw-vid-server
```

## Troubleshooting

### Issue: Domain not resolving

**Solution:**
```bash
# Check DNS
dig yourdomain.com
nslookup yourdomain.com

# Wait longer for DNS propagation (can take up to 48 hours)
# Verify A record in domain registrar
```

### Issue: SSL certificate failed

**Solution:**
```bash
# Check Nginx config
nginx -t

# Verify domain points to server
host yourdomain.com

# Try certbot again
certbot --nginx -d yourdomain.com
```

### Issue: 502 Bad Gateway

**Solution:**
```bash
# Check if Node.js app is running
pm2 status

# Restart app
pm2 restart draw-vid-server

# Check app logs
pm2 logs draw-vid-server

# Verify port 3001 is listening
netstat -tlnp | grep 3001
```

### Issue: Mini App not loading in Telegram

**Solutions:**
1. **URL must be HTTPS** - Telegram requires HTTPS
2. **Check WebApp URL in BotFather** - Must match your domain
3. **Check browser console** - Open Mini App, check for errors
4. **Verify SSL certificate** - Should be valid (green lock)
5. **Check CORS** - Ensure API allows Telegram origin

### Issue: Payment not working

**Solution:**
1. Verify bot has payment permissions in BotFather
2. Check `PAYMENT_PROVIDER_TOKEN` in `.env` (if using external provider)
3. For Telegram Stars, ensure bot is configured correctly
4. Check server logs for invoice creation errors

## Security Checklist

- [ ] Firewall configured (UFW)
- [ ] SSL certificate installed and auto-renewing
- [ ] Strong bot token (never commit to git)
- [ ] Environment variables secured
- [ ] Nginx security headers enabled
- [ ] File upload limits set
- [ ] Regular backups configured
- [ ] PM2 auto-restart enabled
- [ ] Logs monitored regularly

## Auto-renew SSL Certificate

Certbot should auto-renew, but verify:

```bash
# Test renewal
certbot renew --dry-run

# Check auto-renewal timer
systemctl status certbot.timer
```

## Backup Strategy

```bash
# Backup application
tar -czf backup-$(date +%Y%m%d).tar.gz /var/www/draw-vid

# Backup database (if you add one later)
# pg_dump your_database > backup.sql
```

## Performance Optimization

### Enable Gzip Compression

Add to Nginx config:
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
```

### Enable Caching

Already configured in the Nginx config above.

## Next Steps

After deployment:
1. Set up database (PostgreSQL/MongoDB)
2. Configure image storage (S3, Cloudinary)
3. Set up monitoring (Sentry, LogRocket)
4. Configure backups
5. Set up CI/CD pipeline

## Support

If you encounter issues:
1. Check logs first
2. Verify all steps completed
3. Test each component individually
4. Check Telegram Bot API documentation

---

**Your app should now be live at `https://yourdomain.com`!** 🎉
