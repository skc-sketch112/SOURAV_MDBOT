# Use Node 20 on Debian Bullseye
FROM node:20-bullseye

# Set working directory
WORKDIR /usr/src/app

# Install system dependencies (build tools, ffmpeg, libvips, etc.)
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    git \
    ffmpeg \
    pkg-config \
    libvips-dev \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json if exists
COPY package*.json ./

# Remove lock file & clean npm cache
RUN rm -f package-lock.json && npm cache clean --force

# Install dependencies (including express)
RUN npm install --legacy-peer-deps 2>&1 | tee npm-install.log

# Copy all project files
COPY . .

# Expose port for Express
EXPOSE 3000

# Start the bot
CMD ["node", "index.js"]
