# Use stable Node 20 on Debian Bullseye
FROM node:20-bullseye

# Set working directory
WORKDIR /usr/src/app

# Install system dependencies for building native modules + ffmpeg + libvips
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    git \
    ffmpeg \
    pkg-config \
    libvips-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install npm dependencies with legacy peer deps
RUN npm install --legacy-peer-deps

# Copy the rest of your bot files
COPY . .

# Expose the keep-alive server port
EXPOSE 3000

# Start the bot
CMD ["node", "index.js"]
