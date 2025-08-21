const axios = require("axios");

// 🔑 Get Unsplash API Key from environment variable (.env file)
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_KEY;

module.exports = {
    name: "img",
    description: "Search and return up to 10 images from Unsplash",
    async execute(sock, msg, args) {
        const sender = msg.key.remoteJid;
        const query = args.join(" ");

        if (!query) {
            await sock.sendMessage(sender, {
                text: "❌ Please provide a search term.\n👉 Example: `.img cat`"
            });
            return;
        }

        // ✅ Check if API key is set
        if (!UNSPLASH_ACCESS_KEY) {
            await sock.sendMessage(sender, {
                text: "⚠️ Unsplash API key missing! Please set `UNSPLASH_KEY` in your `.env` file."
            });
            return;
        }

        try {
            const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=10&client_id=${UNSPLASH_ACCESS_KEY}`;
            const response =
