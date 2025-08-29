# Use Node 20 LTS
FROM node:20-bullseye

# Set working directory
WORKDIR /usr/src/app

# Install system dependencies for building native modules and ffmpeg
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    git \
    ffmpeg \
    pkg-config \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install npm dependencies with legacy-peer-deps to avoid conflicts
RUN npm install --legacy-peer-deps

# Copy all bot files
COPY . .

# Expose keep-alive port
EXPOSE 3000

# Start bot
CMD ["node", "index.js"]
