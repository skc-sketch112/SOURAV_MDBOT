# ===== Single-stage optimized Dockerfile for production =====
FROM node:20.9.0-slim

WORKDIR /usr/src/app

# Install runtime system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libvips-dev \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy package files first
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy source code
COPY . .

# Optional: prune dev dependencies
RUN npm prune --production

# Expose port if needed (for webhooks or dashboard)
EXPOSE 10000

# Use a process manager to auto-restart on crash
RUN npm install -g pm2

# Start bot using PM2 (auto-restart enabled)
CMD ["pm2-runtime", "index.js", "--name", "whatsapp-userbot"]
