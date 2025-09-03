# ===== WhatsApp Userbot Dockerfile =====
FROM node:20.9.0-bookworm-slim

WORKDIR /usr/src/app

# Install runtime + build dependencies for canvas, ffmpeg, sharp, puppeteer, yt-dlp
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    openssh-client \
    ca-certificates \
    build-essential \
    python3 \
    python3-distutils \
    python3-apt \
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

# ✅ Bookworm ships Python 3.11 by default (no need to force install 3.10)

# Install yt-dlp (latest) manually
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
    -o /usr/local/bin/yt-dlp && chmod a+rx /usr/local/bin/yt-dlp

# Copy package files
COPY package*.json ./

# Install exact Node dependencies from package.json (includes duckduckgo-search and jio-saavn)
RUN npm install --legacy-peer-deps \
    && npm install jio-saavn

# Copy bot source
COPY . .

# Expose port for keep-alive server
EXPOSE 10000

# Persistent auth folder
VOLUME ["/usr/src/app/auth"]

# Start the bot
CMD ["node", "index.js"]
