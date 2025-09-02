# ===== WhatsApp Userbot Dockerfile =====
FROM node:20.9.0-bullseye-slim

WORKDIR /usr/src/app

# Install runtime + build dependencies for canvas, ffmpeg, sharp
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    openssh-client \
    ca-certificates \
    build-essential \
    python3 \
    pkg-config \
    ffmpeg \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    xdg-utils \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install Node dependencies
RUN npm install --legacy-peer-deps

# Copy bot source
COPY . .

# Expose port for keep-alive server
EXPOSE 10000

# Persistent auth folder
VOLUME ["/usr/src/app/auth"]

# Start the bot
CMD ["node", "index.js"]
