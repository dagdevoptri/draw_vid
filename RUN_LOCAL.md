# Running Locally - Frontend + Backend

## Quick Start

You need to run **both** the frontend and backend servers for the app to work properly.

### Option 1: Run Both Separately (Recommended)

**Terminal 1 - Frontend:**
```bash
npm install
npm run dev
```
Frontend runs on: `http://localhost:3000`

**Terminal 2 - Backend:**
```bash
cd server
npm install
cp .env.example .env
# Edit .env and add your BOT_TOKEN
npm start
```
Backend runs on: `http://localhost:3001`

### Option 2: Use a Process Manager

**Install concurrently:**
```bash
npm install -g concurrently
```

**Create a start script** (add to root `package.json`):
```json
{
  "scripts": {
    "dev:all": "concurrently \"npm run dev\" \"cd server && npm start\""
  }
}
```

**Run both:**
```bash
npm run dev:all
```

## Why Both Are Needed

### Frontend (`npm run dev`)
- Serves the React app
- Handles drawing, saving, gallery
- **BUT** cannot create payment invoices alone

### Backend (`cd server && npm start`)
- Creates Telegram payment invoices
- Validates Telegram authentication
- Receives posted drawings
- Handles bot commands

## Payment Flow Requires Backend

When you click "Post" or "Submit":
1. Frontend calls `/api/v1/create-invoice` → **Needs backend**
2. Backend creates TON invoice via Telegram Bot API
3. Frontend opens payment dialog with invoice URL
4. User pays
5. Frontend uploads drawing → **Needs backend**

## Troubleshooting

### Payment Dialog Not Opening

**Problem**: Clicking Post/Submit does nothing

**Solutions**:
1. ✅ **Check backend is running**: `curl http://localhost:3001/health`
   - Should return: `{"status":"ok",...}`
2. ✅ **Check API URL**: Frontend should call `http://localhost:3001/api/v1/create-invoice`
3. ✅ **Check browser console**: Look for network errors
4. ✅ **Check backend logs**: Should see invoice creation attempts

### CORS Errors

If you see CORS errors:
- Backend has CORS enabled, but check `server/index.js`
- Make sure frontend URL is allowed

### 404 on API Calls

**Problem**: `POST http://localhost:3001/api/v1/create-invoice 404`

**Solutions**:
- Verify backend is running on port 3001
- Check `server/index.js` has the route defined
- Verify no port conflicts

### Mock Payment in Development

If backend isn't available, the payment utility will:
- Show a console warning
- Display a confirm dialog (mock payment)
- Allow you to test the flow

But for **real payment testing**, you need the backend running.

## Environment Setup

### Frontend
No special setup needed for local dev.

### Backend
Create `server/.env`:
```env
BOT_TOKEN=your_bot_token_here
WEBAPP_URL=http://localhost:3000
PORT=3001
NODE_ENV=development
SKIP_AUTH=true  # For local testing only
```

## Testing Payment Flow

1. **Start backend**: `cd server && npm start`
2. **Start frontend**: `npm run dev`
3. **Draw something** and save
4. **Click Submit** or go to Gallery and click **Post**
5. **Payment dialog should open** (or mock dialog in dev)

## Quick Check Script

Create `check-servers.sh`:
```bash
#!/bin/bash
echo "Checking servers..."
echo "Frontend:"
curl -s http://localhost:3000 > /dev/null && echo "✅ Frontend running" || echo "❌ Frontend not running"
echo "Backend:"
curl -s http://localhost:3001/health && echo "✅ Backend running" || echo "❌ Backend not running"
```

Run: `chmod +x check-servers.sh && ./check-servers.sh`
