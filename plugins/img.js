const axios = require("axios");

// 🔑 Get Unsplash API Key from .env
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

        if (!UNSPLASH_ACCESS_KEY) {
            await sock.sendMessage(sender, {
                text: "⚠️ Unsplash API key missing!\nPlease set it in `.env` as:\n`Uebb0QGhkVela_0V0ZidmqYXDqAEHRYpV2UnemVHgLY`"
            });
            console.error("❌ Missing UNSPLASH_KEY in environment variables");
            return;
        }

        try {
            const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=10&client_id=${UNSPLASH_ACCESS_KEY}`;
            console.log("🔍 Fetching:", url);

            const response = await axios.get(url);
            const results = response.data.results;

            if (!results || results.length === 0) {
                await sock.sendMessage(sender, {
                    text: `⚠️ No images found for: *${query}*`
                });
                return;
            }

            // ✅ Loop & send each image
            for (let i = 0; i < results.length; i++) {
                const img = results[i];
                await sock.sendMessage(sender, {
                    image: { url: img.urls.regular },
                    caption: `📸 *${query}* (Result ${i + 1})\n👤 By: ${img.user.name} (@${img.user.username || "unknown"})`
                });
            }
        } catch (error) {
            console.error("❌ Error in img.js:", error);
            await sock.sendMessage(sender, {
                text: "⚠️ Failed to fetch images. Please try again later."
            });
        }
    }
};
