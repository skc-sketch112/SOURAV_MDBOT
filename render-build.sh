#!/usr/bin/env bash
set -e

echo "🚀 Starting Render Build for SOURAV_MD..."

# Clean install deps
echo "📦 Installing dependencies..."
npm install --force

# Ensure native modules rebuild correctly
echo "🔧 Rebuilding native modules..."
npm rebuild --force || true

# Make sure ffmpeg is linked properly
echo "🎬 Linking ffmpeg..."
if [ -f ./node_modules/ffmpeg-static/bin/ffmpeg ]; then
  chmod +x ./node_modules/ffmpeg-static/bin/ffmpeg
fi

# Prepare lowdb and other JSON/db folders
echo "🗂️ Preparing database folder..."
mkdir -p ./database
touch ./database/db.json

echo "✅ Build finished successfully!"
