# ===== WhatsApp Userbot Dockerfile =====
FROM node:20.9.0-slim

WORKDIR /usr/src/app

# Install runtime dependencies + build tools + git + ssh + ca-certificates
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    openssh-client \
    ca-certificates \
    build-essential \
    python3 \
    pkg-config \
    ffmpeg \
    libvips-dev \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies with legacy-peer-deps
RUN npm install --legacy-peer-deps

# Copy app source
COPY . .

# Expose port (for webhooks/dashboard)
EXPOSE 10000

# Start the bot directly without PM2 or nodemon
CMD ["node", "index.js"]
