#!/usr/bin/env bash
set -e

echo "🚀 Starting Ultra Render Build for SOURAV_MD Bot..."

# Update system & install base tools
apt-get update -y
apt-get upgrade -y
apt-get install -y wget curl git unzip build-essential python3 python3-pip

# FFmpeg installation (for stickers, audio/video, song.js)
echo "🎵 Installing FFmpeg..."
apt-get install -y ffmpeg
npm install -g ffmpeg-static @ffmpeg-installer/ffmpeg

# Ensure Node.js version
echo "⚡ Ensuring correct Node.js version..."
node -v
npm -v

# Install PM2 globally (process manager, keeps bot alive)
echo "🔄 Installing PM2..."
npm install -g pm2

# Rebuild native modules for Render environment
echo "🔧 Rebuilding modules..."
npm rebuild

# Install project dependencies
echo "📦 Installing npm dependencies..."
npm install --legacy-peer-deps

# Cache clear
echo "🧹 Cleaning npm cache..."
npm cache clean --force

# Symlink ffmpeg + ffprobe if not linked
if ! command -v ffmpeg &> /dev/null; then
  echo "🔗 Linking ffmpeg..."
  ln -s /usr/bin/ffmpeg /usr/local/bin/ffmpeg
  ln -s /usr/bin/ffprobe /usr/local/bin/ffprobe
fi

# Final check
echo "✅ Build complete! You can now start SOURAV_MD bot with: pm2 start index.js"
