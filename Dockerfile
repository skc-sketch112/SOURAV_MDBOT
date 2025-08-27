# Dockerfile for SouravMD Bot
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if exists)
COPY package*.json ./

# Configure npm to avoid proxy issues during install
RUN npm config set strict-ssl false \
    && npm config set proxy null \
    && npm config set https-proxy null

# Install dependencies without proxy
RUN npm install --no-proxy --force

# Copy the rest of the application code
COPY . .

# Install system dependencies required for ytdl-core (ffmpeg)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Environment variables will be set via Render dashboard
# No ENV lines here; use Render's Environment tab instead

# Command to run the bot
CMD ["npm", "run", "dev"]
