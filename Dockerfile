# ================================
# 🔨 Build Stage (with full tools)
# ================================
FROM node:20-bullseye AS builder

WORKDIR /usr/src/app

# Install required build deps
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    git \
    curl \
    ffmpeg \
    pkg-config \
    libvips-dev \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies (skip optional peer conflicts)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# ================================
# 🚀 Runtime Stage (optimized)
# ================================
FROM node:20-slim

WORKDIR /usr/src/app

# Install only runtime deps (minimal image, but includes ffmpeg, sharp deps, curl)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libvips-dev \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy compiled node_modules and app code from builder
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app ./

# Expose keep-alive / Express server port
EXPOSE 3000

# Healthcheck (restarts container if bot is unresponsive)
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Run the bot
CMD ["node", "index.js"]
