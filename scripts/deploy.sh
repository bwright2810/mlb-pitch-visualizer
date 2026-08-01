#!/bin/bash

# MLB Pitch Visualizer Deployment Script

echo "🚀 Starting MLB Pitch Visualizer deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the mlb-pitch-visualizer directory"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📋 Deployment options:"
    echo "1. Run locally: npm run dev"
    echo "2. Start production server: npm start"
    echo "3. Deploy to Vercel: npx vercel --prod"
    echo "4. Deploy to Netlify: Build command: npm run build, Publish directory: .next"
    echo ""
    echo "🌐 The application will be available at:"
    echo "   - Local: http://localhost:3000"
    echo "   - Network: http://$(hostname -I | awk '{print $1}'):3000"
else
    echo "❌ Build failed! Check for errors above."
    exit 1
fi