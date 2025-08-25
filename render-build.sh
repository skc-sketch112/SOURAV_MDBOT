#!/usr/bin/env bash
set -e

log() {
  TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
  echo "{\"time\":\"$TIMESTAMP\",\"level\":\"info\",\"msg\":\"$1\"}"
}

error_exit() {
  TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
  echo "{\"time\":\"$TIMESTAMP\",\"level\":\"error\",\"msg\":\"$1\"}"
  exit 1
}

log "🔥 Starting Ultra Pro Render Build for SOURAV_MD 🔥"

# Check Node.js version
NODE_VER=$(node -v || echo "not-installed")
log "⚡ Node.js version: $NODE_VER"
if [[ "$NODE_VER" == "not-installed" ]]; then
  error_exit "Node.js not found! Render environment broken."
fi

# Clean old modules
log "🧹 Cleaning old cache..."
rm -rf node_modules ./yt-dlp ./ffmpeg || true
npm cache clean --force || true

# Install yt-dlp
log "📥 Downloading yt-dlp..."
curl -fsSL https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o ./yt-dlp || error_exit "yt-dlp download failed!"
chmod +x ./yt-dlp
log "✅ yt-dlp installed!"

# Ensure ffmpeg
log "🎵 Setting up ffmpeg..."
if [ ! -f "./node_modules/ffmpeg-static/ffmpeg" ]; then
  log "⚡ Installing ffmpeg-static + fluent-ffmpeg..."
  npm install ffmpeg-static fluent-ffmpeg --save || error_exit "Failed to install ffmpeg modules!"
fi
log "✅ ffmpeg ready!"

# Extra bin permissions
chmod +x ./node_modules/.bin/* || true

log "🚀 Build finished successfully! SOURAV_MD is ultra pro ready."
