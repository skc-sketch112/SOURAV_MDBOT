# -------------------------
# Stage 1: Build dependencies
# -------------------------
FROM node:20-slim AS builder

WORKDIR /app

# Install system deps required for building some npm packages
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    git \
  && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev) in builder
RUN npm install

# Copy full source
COPY . .

# -------------------------
# Stage 2: Production runtime
# -------------------------
FROM node:20-slim AS runner

WORKDIR /app

# Install runtime dependencies only (ffmpeg + git if bot uses it)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
  && rm -rf /var/lib/apt/lists/*

# Copy only production node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy source code (but ignore dev junk via .dockerignore)
COPY --from=builder /app ./

# Environment (can be overridden at runtime)
ENV NODE_ENV=production

# Healthcheck (Render will know if container is alive)
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD node -e "require('net').connect(3000).on('error', () => process.exit(1))"

# Run bot
CMD ["npm", "run", "dev"]
