#!/usr/bin/env bash
set -e

echo "🚀 Starting Render build setup..."

# Update system
apt-get update -y

# Install core tools
apt-get install -y ffmpeg imagemagick wget curl unzip

# Download yt-dlp binary
echo "⬇️ Downloading yt-dlp..."
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o ./yt-dlp
chmod +x ./yt-dlp

# Ensure node modules installed cleanly
echo "📦 Installing Node.js dependencies..."
npm install

echo "✅ Build setup completed successfully!"
