# Quick Start - Testing Guide

## 🚀 Fastest Way to Test

### 1. Install & Run
```bash
npm install
npm run dev
```

### 2. Open Browser
Navigate to: **http://localhost:3000**

### 3. Start Drawing!
- **Mouse**: Click and drag to draw
- **Touch**: Touch and drag on mobile/tablet
- **Tools**: Switch between Pen and Eraser
- **Colors**: Click color picker to change stroke color
- **Width**: Adjust slider to change stroke width

### 4. Debug Panel (Development Mode)
Click the **🔍 Debug** button (top-left) to:
- View session data
- Inspect strokes
- Copy/download JSON data
- See real-time state

## 🧪 What to Test

### ✅ Basic Functionality
- [ ] Draw a line
- [ ] Draw a circle
- [ ] Erase part of drawing
- [ ] Change colors
- [ ] Adjust stroke width
- [ ] Undo last stroke
- [ ] Redo undone stroke
- [ ] Clear all strokes

### ✅ Data Inspection
1. Draw something
2. Click **🔍 Debug** button
3. Click **"Copy JSON"** or **"Log to Console"**
4. Verify:
   - Points are normalized [0-1]
   - Timestamps are present
   - Stroke structure is correct

### ✅ Performance
- Draw quickly (should be smooth)
- Draw many strokes (should remain responsive)
- Test on mobile device (touch should work)

## 📱 Testing in Telegram

### Quick Setup with ngrok:

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **In another terminal, expose with ngrok:**
   ```bash
   npx ngrok http 3000
   ```

3. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

4. **Create Telegram Bot:**
   - Message [@BotFather](https://t.me/BotFather)
   - Send `/newbot` → follow instructions
   - Send `/newapp` → select your bot
   - Provide ngrok URL as WebApp URL

5. **Test in Telegram:**
   - Open your bot
   - Click the WebApp button
   - Start drawing!

## 🔍 Debugging

### Browser Console
Open DevTools (F12) to see:
- `[Telegram WebApp]` logs (when not in Telegram)
- Drawing events
- State changes
- API requests

### Debug Panel Features
- **Session Info**: ID, user, timestamps
- **Canvas State**: Size, tool, style
- **Strokes**: Count, points, details
- **Actions**: Log, copy, download JSON

### Network Tab
Check API calls when clicking "Submit":
- Request payload structure
- Headers (initData, version)
- Response/errors

## 🐛 Common Issues

**Canvas not responding?**
- Check console for errors
- Try refreshing page
- Ensure browser supports Canvas API

**Telegram features not working?**
- Normal in browser - Telegram SDK mocks are used
- Deploy to Telegram for full functionality

**Styling looks wrong?**
- Clear browser cache
- Check TailwindCSS compiled correctly

## 📊 Expected Data Format

When you inspect strokes, you should see:
```json
{
  "strokeId": "stroke_1234567890_abc123",
  "tool": "pen",
  "points": [
    {
      "x": 0.25,      // normalized [0-1]
      "y": 0.5,       // normalized [0-1]
      "t": 1234567890, // timestamp (ms)
      "pressure": 0.5  // optional
    }
  ],
  "startTime": 1234567890,
  "endTime": 1234567900,
  "style": {
    "color": "#000000",
    "width": 3,
    "opacity": 1
  }
}
```

## ✨ Next Steps

1. **Test all features** locally
2. **Deploy** to hosting (Vercel/Netlify)
3. **Set up Telegram bot** with WebApp
4. **Test in Telegram** environment
5. **Connect backend API** for submission

For detailed testing guide, see [TESTING.md](./TESTING.md)
