# ===== WhatsApp Userbot Dockerfile =====
FROM node:20.9.0-slim

WORKDIR /usr/src/app

# Install runtime dependencies
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

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy app source
COPY . .

# Install PM2 globally (prod)
RUN npm install -g pm2

# Install nodemon globally (dev)
RUN npm install -g nodemon

# Expose port (for webhooks/dashboard)
EXPOSE 10000

# Auto-detect environment based on branch
CMD if [ "$RENDER_GIT_BRANCH" = "main" ]; then \
        echo "Starting production with PM2"; \
        pm2-runtime index.js --name whatsapp-userbot; \
    else \
        echo "Starting development with nodemon"; \
        nodemon index.js; \
    fi
