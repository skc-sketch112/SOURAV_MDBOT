#!/usr/bin/env bash
set -e

echo "🚀 Starting Render Build for SOURAV_MD..."

# Install production dependencies only
npm install --production --force

# Rebuild any native modules (ignore errors safely)
echo "🔧 Rebuilding native modules..."
npm rebuild --force || true

# Make sure ffmpeg is executable
echo "🎬 Ensuring ffmpeg works..."
if [ -f ./node_modules/ffmpeg-static/ffmpeg ]; then
  chmod +x ./node_modules/ffmpeg-static/ffmpeg
  echo "✅ ffmpeg is ready."
else
  echo "⚠️ ffmpeg-static not found, skipping..."
fi

# Prepare database folder
echo "🗂️ Preparing database..."
mkdir -p ./database
touch ./database/db.json

echo "✅ Render Build finished successfully!"
exit 0
