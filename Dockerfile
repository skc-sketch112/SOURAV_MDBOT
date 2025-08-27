# Dockerfile for SouravMD Bot
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if exists)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Install system dependencies required for ytdl-core (ffmpeg) and canvas
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables (optional, can be overridden in Render)
ENV NODE_ENV=production
ENV HTTP_PROXY=http://your-proxy:port  # Replace with a valid proxy or remove

# Command to run the bot
CMD ["npm", "run", "dev"]
