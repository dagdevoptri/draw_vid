# Quick Run Guide

## 🚀 Run Everything (Easiest Way)

### Step 1: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Step 2: Setup Backend

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and add your bot token:
```env
BOT_TOKEN=your_bot_token_here
WEBAPP_URL=http://localhost:3000
PORT=3001
NODE_ENV=development
SKIP_AUTH=true
```

### Step 3: Run Both Servers

**Option A: Run separately (2 terminals)**

Terminal 1:
```bash
npm run dev
```

Terminal 2:
```bash
npm run dev:server
```

**Option B: Run together (1 terminal)**

First install concurrently:
```bash
npm install
```

Then run:
```bash
npm run dev:all
```

## ✅ Verify It's Working

1. **Frontend**: Open `http://localhost:3000`
2. **Backend**: Check `http://localhost:3001/health` (should return JSON)

## 🐛 Payment Not Working?

### Check Backend is Running

```bash
curl http://localhost:3001/health
```

Should return: `{"status":"ok","timestamp":"..."}`

### Check Browser Console

Open DevTools (F12) and look for:
- ✅ Network requests to `/api/v1/create-invoice`
- ❌ Any errors (404, CORS, etc.)

### Common Issues

1. **Backend not running** → Start it: `cd server && npm start`
2. **Wrong port** → Check backend is on port 3001
3. **CORS error** → Backend should allow localhost:3000
4. **404 error** → Check API route exists in `server/index.js`

## 💡 Development Mode

In development, if backend isn't available:
- Payment will show a **mock dialog** (confirm box)
- Click "OK" to simulate successful payment
- This lets you test the flow without real payments

## 📝 Next Steps

Once both servers are running:
1. Draw something
2. Click "Save"
3. Click "Submit" or go to Gallery and click "Post"
4. Payment dialog should appear (or mock dialog in dev)
