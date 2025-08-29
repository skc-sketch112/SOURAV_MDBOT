FROM node:20-bullseye

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    git \
    ffmpeg \
    pkg-config \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

# Clean cache first
RUN npm cache clean --force

# Install dependencies + full log
RUN npm install --legacy-peer-deps 2>&1 | tee npm-install.log

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
