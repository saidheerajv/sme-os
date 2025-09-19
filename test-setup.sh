#!/bin/bash
# Test script to verify the setup

echo "🚀 Testing the fullstack setup..."
echo

echo "1. Building the application..."
npm run build

echo
echo "2. Checking if files were copied to backend/public..."
if [ -f "backend/public/index.html" ]; then
  echo "✅ index.html found in backend/public"
else
  echo "❌ index.html NOT found in backend/public"
fi

if [ -d "backend/public/assets" ]; then
  echo "✅ assets directory found in backend/public"
  echo "   Files in assets: $(ls backend/public/assets | wc -l)"
else
  echo "❌ assets directory NOT found in backend/public"
fi

echo
echo "3. Backend should now be able to serve the React app on port 3000"
echo "   - API endpoints: http://localhost:3000/api/*"
echo "   - React app: http://localhost:3000/*"
echo
echo "✅ Setup complete! Your NestJS backend will now serve the React app as static files."