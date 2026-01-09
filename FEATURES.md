# New Features Guide

## Overview

The app now includes:
1. **Save Functionality** - Save drawings locally
2. **Gallery Page** - View and manage saved drawings
3. **Telegram Stars Payment** - Pay to post drawings
4. **Post to Server** - Upload drawings after payment

## Feature Details

### 1. Save Button

**Location**: Top-left corner of drawing canvas

**Functionality**:
- Saves current drawing to browser's localStorage
- Generates thumbnail preview
- Stores complete drawing session data (vector strokes)
- Maximum 50 saved drawings (oldest auto-deleted)

**Usage**:
1. Draw something
2. Click "💾 Save" button
3. Drawing is saved with auto-generated name

### 2. Gallery Page

**Access**: Click "📁 Gallery" button in header

**Features**:
- Grid view of all saved drawings
- Thumbnail previews
- Drawing name and date
- Delete functionality
- Select drawing to post

**Usage**:
1. Click "📁 Gallery" in header
2. Browse saved drawings
3. Click on a drawing to select it
4. Click "Post" button to post (requires payment)

### 3. Telegram Stars Payment

**Integration**: Uses Telegram's native payment system

**Flow**:
1. User clicks "⭐ Post" button
2. System creates invoice via backend
3. Telegram payment dialog opens
4. User pays with Telegram Stars
5. On success, drawing is posted

**Price**: 10 Telegram Stars (configurable in `PostButton.tsx`)

**Requirements**:
- Bot must have Stars payment enabled
- User must have Stars balance
- HTTPS required (Telegram requirement)

### 4. Post to Server

**After Payment**:
- Drawing is converted to PNG image
- Image is uploaded to server
- Server saves to `/uploads` directory
- Returns post URL

**API Endpoint**: `POST /api/v1/posts`

**Payload**:
- Image file (multipart/form-data)
- Drawing ID
- Session data (JSON)
- Telegram initData (for auth)

## Technical Implementation

### Storage

**Location**: Browser localStorage
**Key**: `draw_vid_saved_drawings`
**Format**: JSON array of `SavedDrawing` objects

**Structure**:
```typescript
{
  id: string,
  session: DrawingSession,
  thumbnail?: string,  // Base64 image
  savedAt: number,      // Timestamp
  name?: string         // User-friendly name
}
```

### Payment Flow

1. **Frontend**: User clicks "Post"
2. **Frontend**: Calls `/api/v1/create-invoice`
3. **Backend**: Creates Telegram invoice
4. **Frontend**: Opens invoice via `WebApp.openInvoice()`
5. **Telegram**: Handles payment
6. **Frontend**: Receives payment status callback
7. **Frontend**: If paid, uploads drawing to `/api/v1/posts`
8. **Backend**: Saves image and returns post URL

### Image Conversion

Drawings are converted from vector strokes to PNG:
- Canvas created at original canvas size
- Strokes rendered in order
- Exported as PNG blob
- Uploaded as multipart/form-data

## Configuration

### Change Post Price

Edit `src/components/PostButton.tsx`:
```typescript
const POST_PRICE_STARS = 10; // Change this value
```

### Change Max Saved Drawings

Edit `src/utils/storage.ts`:
```typescript
const MAX_SAVED = 50; // Change this value
```

### Server Upload Directory

Default: `server/uploads/`

Change in `server/index.js`:
```javascript
const uploadsDir = join(__dirname, '../uploads');
```

## Testing

### Local Testing (Without Payment)

1. Draw something
2. Click "Save"
3. Click "Gallery"
4. Click "Post"
5. In development, payment is mocked (confirm dialog)
6. Drawing uploads to server

### Production Testing (With Payment)

1. Ensure bot has Stars payment enabled
2. User must have Stars balance
3. Follow payment flow
4. Verify image saved in `/uploads` directory

## Troubleshooting

### Save Not Working

- Check browser supports localStorage
- Check console for errors
- Verify drawing has strokes before saving

### Gallery Empty

- Check localStorage in browser DevTools
- Verify drawings were saved successfully
- Check for storage quota exceeded

### Payment Not Opening

- Verify HTTPS is enabled (required by Telegram)
- Check bot has Stars payment enabled
- Verify `openInvoice` API is available
- Check browser console for errors

### Image Not Uploading

- Check server logs
- Verify `/uploads` directory exists and is writable
- Check file size limits (10MB default)
- Verify multer is configured correctly

## Security Considerations

1. **Payment Validation**: Server validates initData before processing
2. **File Upload Limits**: 10MB max file size
3. **Storage Limits**: Max 50 saved drawings per user
4. **HTTPS Required**: All production deployments must use HTTPS

## Future Enhancements

- [ ] Cloud storage (S3, Cloudinary) for images
- [ ] Database for post metadata
- [ ] Public gallery page
- [ ] User profiles and post history
- [ ] Payment history tracking
- [ ] Refund functionality
