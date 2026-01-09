# UI Guide - Button Locations & Payment Flow

## Button Locations

### Main Drawing Screen

1. **💾 Save Button** (Top-left, below header)
   - Location: Fixed position, top-left corner
   - Color: Green
   - Function: Saves current drawing to local storage
   - Visible when: You have drawn something
   - Disabled when: No strokes drawn

2. **📤 Submit Button** (Top-right, below header)
   - Location: Fixed position, top-right corner
   - Color: Blue
   - Function: Sends drawing to backend API
   - Visible when: You have drawn something
   - Disabled when: No strokes drawn

3. **📁 Gallery Button** (Header, top-left)
   - Location: In the header bar
   - Function: Opens gallery to view saved drawings
   - Always visible

### Gallery Screen

1. **← Back Button** (Header, top-left)
   - Returns to drawing screen

2. **Delete Button** (On each drawing card)
   - Deletes the selected drawing

3. **⭐ Post Button** (On selected drawing card)
   - Location: Appears when you click on a drawing
   - Color: Blue
   - Function: Opens payment dialog, then posts drawing
   - Shows: "⭐ Post (10 Stars)"

## Payment Flow

### Step-by-Step Process

1. **Draw Something**
   - Use the canvas to create your drawing
   - Switch between pen and eraser tools
   - Adjust colors and stroke width

2. **Save Your Drawing**
   - Click the **💾 Save** button (top-left)
   - Drawing is saved to browser storage
   - You'll see a confirmation message

3. **Open Gallery**
   - Click **📁 Gallery** button in header
   - View all your saved drawings
   - See thumbnails, names, and dates

4. **Select a Drawing**
   - Click on any drawing card
   - It will be highlighted (blue border)
   - **⭐ Post** button appears below

5. **Post with Payment**
   - Click **⭐ Post (10 Stars)** button
   - Telegram payment dialog opens
   - Pay with Telegram Stars
   - On success, drawing uploads to server

### Payment States

- **Before Payment**: Button shows "⭐ Post (10 Stars)"
- **Processing**: Button shows "⏳ Posting..."
- **Success**: Alert shows "Drawing posted successfully! 🎉"
- **Failed**: Alert shows error message

## Troubleshooting

### Save Button Not Visible

**Problem**: Can't see the Save button

**Solutions**:
- Make sure you've drawn something (button is disabled when empty)
- Check if header is covering it (should be at `top-20` now)
- Try scrolling or resizing window
- Check browser console for errors

### Payment Not Working

**Problem**: Payment dialog doesn't open

**Solutions**:
1. **In Development**:
   - Payment is mocked with a confirm dialog
   - Click "OK" to simulate successful payment

2. **In Production**:
   - Ensure HTTPS is enabled (required by Telegram)
   - Verify bot has Stars payment enabled
   - Check user has Stars balance
   - Verify `openInvoice` API is available

3. **Check Console**:
   - Open browser DevTools (F12)
   - Look for errors in Console tab
   - Check Network tab for API calls

### Post Button Not Appearing

**Problem**: Can't see Post button in Gallery

**Solutions**:
- Make sure you've clicked on a drawing card (it should highlight)
- Check if drawing is selected (blue border)
- Verify you have saved drawings in gallery
- Try refreshing the gallery page

### Payment Succeeds But Post Fails

**Problem**: Payment works but image doesn't upload

**Solutions**:
- Check server logs for errors
- Verify `/uploads` directory exists and is writable
- Check file size (max 10MB)
- Verify API endpoint is accessible
- Check network tab for failed requests

## Visual Layout

```
┌─────────────────────────────────────────┐
│ [📁 Gallery]  Title  [        ]         │ ← Header (fixed top)
├─────────────────────────────────────────┤
│ [💾 Save]                    [📤 Submit]│ ← Action buttons (fixed)
│                                           │
│                                           │
│              Canvas Area                  │
│         (Drawing space)                   │
│                                           │
│                                           │
├─────────────────────────────────────────┤
│  [Pen] [Eraser]  [Color] [Width]        │ ← Toolbar (fixed bottom)
│  [Undo] [Redo] [Clear]                  │
└─────────────────────────────────────────┘
```

## Gallery Layout

```
┌─────────────────────────────────────────┐
│ [← Back]  Saved Drawings  [        ]   │ ← Header
├─────────────────────────────────────────┤
│ ┌────────┐  ┌────────┐                │
│ │ Thumb  │  │ Thumb  │                 │
│ │ Name   │  │ Name   │                 │
│ │ Date   │  │ Date   │                 │
│ │[Delete]│  │[Delete]│                 │
│ │[⭐ Post]│  │        │                 │ ← Post appears when selected
│ └────────┘  └────────┘                │
│                                           │
│ ┌────────┐  ┌────────┐                │
│ │ ...    │  │ ...    │                 │
│ └────────┘  └────────┘                │
└─────────────────────────────────────────┘
```

## Quick Reference

| Button | Location | When Visible | Function |
|--------|----------|--------------|----------|
| 💾 Save | Top-left | When strokes exist | Save to storage |
| 📤 Submit | Top-right | When strokes exist | Send to API |
| 📁 Gallery | Header left | Always | Open gallery |
| ⭐ Post | Gallery card | When drawing selected | Pay & post |
| Delete | Gallery card | Always | Delete drawing |
