#!/bin/bash

# Quick test script for local development
# Usage: ./scripts/test-local.sh

echo "🚀 Starting Draw Vid Mini App for testing..."
echo ""
echo "📝 Testing Checklist:"
echo "  ✓ Open http://localhost:3000 in your browser"
echo "  ✓ Try drawing with mouse/touch"
echo "  ✓ Test pen and eraser tools"
echo "  ✓ Adjust color and width"
echo "  ✓ Test undo/redo"
echo "  ✓ Click 'Debug' button to inspect data"
echo "  ✓ Click 'Submit' to test API (will fail without backend)"
echo ""
echo "💡 Tips:"
echo "  - Open browser DevTools to see console logs"
echo "  - Check Network tab to see API requests"
echo "  - Use Debug panel to inspect stroke data"
echo ""

npm run dev
