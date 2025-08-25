#!/usr/bin/env bash
set -e

echo "🚀 Starting Render Build for SOURAV_MD..."

# Use only production deps (skip devDeps to save time)
npm install --production --force

echo "🔧 Rebuilding native modules..."
npm rebuild --force || true

echo "🎬 Ensuring ffmpeg works..."
if [ -f ./node_modules/ffmpeg-static/ffmpeg ]; then
  chmod +x ./node_modules/ffmpeg-static/ffmpeg
fi

echo "🗂️ Preparing database..."
mkdir -p ./database
touch ./database/db.json

echo "✅ Build finished!"
