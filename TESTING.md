# Testing Guide

## Quick Start - Local Development Testing

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 3. Test in Browser (Mock Telegram Environment)

The app includes a mock Telegram WebApp SDK that works in regular browsers. You can:
- Draw with mouse or touch
- Test all tools (pen, eraser)
- Adjust colors and stroke width
- Test undo/redo
- Test clear functionality

**Note**: The Telegram-specific features (user ID, haptic feedback, etc.) will use console mocks when not in Telegram.

## Testing in Telegram (Production)

### Option 1: Using ngrok (Quick Testing)

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Install ngrok:**
   ```bash
   npm install -g ngrok
   # or
   brew install ngrok
   ```

3. **Expose your local server:**
   ```bash
   ngrok http 3000
   ```

4. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

5. **Create a Telegram Bot:**
   - Message [@BotFather](https://t.me/BotFather) on Telegram
   - Send `/newbot` and follow instructions
   - Get your bot token

6. **Set WebApp URL:**
   - Send `/newapp` to BotFather
   - Select your bot
   - Provide app title and description
   - Provide the ngrok URL as the WebApp URL
   - Get the WebApp button

7. **Test:**
   - Open your bot in Telegram
   - Click the WebApp button
   - The Mini App should load!

### Option 2: Deploy to Production

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Deploy to hosting:**
   - **Vercel**: `npm i -g vercel && vercel`
   - **Netlify**: Drag `dist` folder to Netlify
   - **GitHub Pages**: Use GitHub Actions
   - **Any static host**: Upload `dist` folder

3. **Set WebApp URL** in BotFather to your deployed URL

## Testing Checklist

### Drawing Functionality
- [ ] Can draw with mouse (desktop)
- [ ] Can draw with touch (mobile)
- [ ] Strokes are smooth and responsive
- [ ] Pen tool works correctly
- [ ] Eraser tool works correctly
- [ ] Color picker changes stroke color
- [ ] Width slider changes stroke width
- [ ] Undo removes last stroke
- [ ] Redo restores undone stroke
- [ ] Clear removes all strokes

### Data Capture
- [ ] Strokes are captured as vectors (check console/network)
- [ ] Points are normalized to [0-1] range
- [ ] Timestamps are included in points
- [ ] Pressure data captured (if device supports)

### Telegram Integration
- [ ] App initializes Telegram WebApp SDK
- [ ] User ID is captured from Telegram
- [ ] Haptic feedback works (on mobile)
- [ ] Theme colors applied (if available)
- [ ] App expands to full height

### API Integration
- [ ] Submit button sends data to backend
- [ ] Payload includes sessionId, userId, strokes
- [ ] initData is included for authentication
- [ ] Error handling works correctly

## Debug Mode

Open browser console to see:
- Telegram WebApp API calls (prefixed with `[Telegram WebApp]`)
- Drawing events
- State changes
- API requests/responses

## Common Issues

### "Telegram WebApp not found"
- This is normal in browser testing
- The app uses mocks for development
- Deploy to Telegram for full functionality

### "Canvas not responding"
- Check browser console for errors
- Ensure touch events aren't blocked
- Try refreshing the page

### "API errors"
- Check `VITE_API_BASE_URL` is set correctly
- Verify backend is running and accessible
- Check CORS settings on backend

### "Styling issues"
- Clear browser cache
- Check TailwindCSS is compiling correctly
- Verify viewport meta tag is present

## Performance Testing

### Desktop
- Should maintain 60 FPS during drawing
- No lag with many strokes
- Smooth undo/redo

### Mobile
- Touch response < 16ms
- No jank during drawing
- Memory usage reasonable

## Manual Testing Script

1. **Basic Drawing:**
   - Draw a simple line
   - Draw a circle
   - Draw quickly (test performance)

2. **Tool Switching:**
   - Switch between pen and eraser
   - Draw with each tool
   - Verify eraser removes strokes

3. **Style Changes:**
   - Change color multiple times
   - Adjust width while drawing
   - Verify changes apply immediately

4. **Undo/Redo:**
   - Draw 3 strokes
   - Undo twice
   - Redo once
   - Verify correct state

5. **Clear:**
   - Draw multiple strokes
   - Clear all
   - Verify canvas is empty
   - Undo to restore

6. **Submit:**
   - Draw something
   - Click submit
   - Check network tab for request
   - Verify payload structure
