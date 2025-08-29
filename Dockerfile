FROM node:20-bullseye

WORKDIR /usr/src/app

# Install build tools + ffmpeg + libvips + other dependencies
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

# Copy package.json
COPY package.json ./

# Remove lock file & clean cache
RUN rm -f package-lock.json && npm cache clean --force

# Install dependencies with logging
RUN npm install --legacy-peer-deps 2>&1 | tee npm-install.log

# Copy bot files
COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
