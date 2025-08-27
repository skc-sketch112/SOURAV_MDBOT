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

# Install dependencies
RUN npm install --no-proxy --force

# Copy the rest of the application code
COPY . .

# Install system dependencies (git and ffmpeg) without proxy
RUN apt-get update -o Acquire::http::No-Proxy="deb.debian.org" && apt-get install -y \
    git \
    ffmpeg \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Environment variables will be set via Render dashboard
# No ENV lines here; use Render's Environment tab instead

# Command to run the bot
CMD ["npm", "run", "dev"]
