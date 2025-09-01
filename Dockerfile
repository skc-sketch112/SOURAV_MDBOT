# ================================
# 🔨 Build Stage (with all dev tools)
# ================================
FROM node:20-bullseye AS builder

WORKDIR /usr/src/app

# Install build dependencies for native modules
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

# Install npm dependencies (build complete here)
RUN npm install --legacy-peer-deps

# Copy all project files
COPY . .

# ================================
# 🚀 Runtime Stage (lightweight)
# ================================
FROM node:20-bullseye

WORKDIR /usr/src/app

# Install only runtime dependencies
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

# Copy node_modules from builder (already compiled)
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copy project files
COPY --from=builder /usr/src/app ./

# Expose Express/keep-alive port
EXPOSE 3000

# Add Healthcheck (pings the bot every 30s, retries 3 times)
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start bot
CMD ["node", "index.js"]
