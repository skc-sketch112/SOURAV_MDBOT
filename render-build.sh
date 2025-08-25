#!/usr/bin/env bash
set -e

echo "🔥 Starting Ultra Pro Render Build for SOURAV_MD 🔥"

# Clean cache & old builds
echo "🧹 Cleaning old cache..."
rm -rf node_modules
rm -rf ./yt-dlp
rm -rf ./ffmpeg
npm cache clean --force || true

# Install yt-dlp (latest release)
echo "📥 Downloading yt-dlp..."
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o ./yt-dlp
chmod +x ./yt-dlp
echo "✅ yt-dlp installed!"

# Ensure ffmpeg (via ffmpeg-static + fluent-ffmpeg)
echo "🎵 Setting up ffmpeg..."
if [ ! -f "./node_modules/ffmpeg-static/ffmpeg" ]; then
  echo "⚡ Installing ffmpeg-static..."
  npm install ffmpeg-static fluent-ffmpeg --save
fi
echo "✅ ffmpeg ready!"

# Extra permissions for Render
chmod +x ./node_modules/.bin/* || true

echo "🚀 Build finished successfully! SOURAV_MD is ready."
