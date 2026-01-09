# Draw Vid - Telegram Mini App

A high-performance, mobile-first drawing interface for Telegram Mini Apps that captures precise user drawing data in a vector-first, time-aware format for AI video generation pipelines.

## Architecture

This Mini App implements a **vector-first, time-aware, intent-separated** architecture:

- **Vector-first**: Strokes are stored as point sequences, not bitmaps
- **Time-aware**: All strokes include temporal information
- **Intent-separated**: Geometry (strokes) is separated from user intent (actions)
- **Edge-light**: Minimal client-side processing, cloud-heavy AI inference

## Features

- ✅ Touch, mouse, and stylus input support
- ✅ Vector stroke capture with temporal awareness
- ✅ Real-time canvas rendering at 60 FPS
- ✅ Input normalization and preprocessing
- ✅ Undo/redo functionality
- ✅ Telegram WebApp SDK integration
- ✅ Secure authentication via Telegram initData
- ✅ Batch upload to backend API
- ✅ WebSocket streaming support (prepared)

## Technology Stack

- **React** + **TypeScript** - Frontend framework
- **Zustand** - State management
- **HTML5 Canvas** - Rendering layer
- **Telegram WebApp SDK** - Mini App integration
- **TailwindCSS** - Styling
- **Vite** - Build tooling

## Getting Started

### Quick Start

1. **Frontend (Mini App):**
   ```bash
   npm install
   npm run dev
   ```
   Open `http://localhost:3000`

2. **Backend (Server + Bot):**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your BOT_TOKEN
   npm start
   ```

3. **Create Telegram Bot:**
   - Message [@BotFather](https://t.me/BotFather)
   - Send `/newbot` and follow instructions
   - Copy your bot token to `server/.env`

See [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) for detailed setup instructions.

### Build

```bash
npm run build
```

Output will be in the `dist` directory (served by the backend server).

## Configuration

Set the backend API URL via environment variable:

```bash
VITE_API_BASE_URL=https://your-api.com npm run dev
```

## Data Model

### Stroke Structure

```typescript
{
  strokeId: string,
  tool: "pen" | "eraser" | "shape" | "text",
  points: Point[],
  startTime: number,
  endTime: number,
  style: {
    color: string,
    width: number,
    opacity: number
  }
}
```

### Point Structure

```typescript
{
  x: number,          // normalized [0-1]
  y: number,          // normalized [0-1]
  t: number,          // timestamp (ms)
  pressure?: number   // optional [0-1]
}
```

## API Integration

The app sends drawing sessions to the backend in the following format:

```json
{
  "sessionId": "...",
  "userId": "...",
  "canvasSize": { "w": 1080, "h": 1920 },
  "strokes": [...],
  "intent": {
    "action": "none",
    "text": "..."
  },
  "timestamp": 1234567890
}
```

All requests include Telegram `initData` for authentication.

## Performance Considerations

- All drawing operations are client-side
- No blocking network calls during drawing
- Canvas rendering optimized for 60 FPS
- Memory-efficient stroke storage
- Graceful degradation on low-end devices

## Extensibility

The architecture supports:
- Multi-layer drawing
- Keyframe-based edits
- Collaborative drawing (future)
- AI-assisted suggestions
- Offline buffering & retry

## License

MIT

