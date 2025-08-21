const axios = require("axios");

const UNSPLASH_ACCESS_KEY = "Uebb0QGhkVela_0V0ZidmqYXDqAEHRYpV2UnemVHgLY"; // 🔑 Put your actual key here

module.exports = {
    name: "img",
    description: "Search and return up to 10 images from Unsplash",
    async execute(sock, msg, args) {
        const sender = msg.key.remoteJid;
        const query = args.join(" ");

        if (!query) {
            await sock.sendMessage(sender, { text: "❌ Please provide a search term.\nExample: `.img cat`" });
            return;
        }

        try {
            const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=10&client_id=${UNSPLASH_ACCESS_KEY}`;
            const response = await axios.get(url);

            if (!response.data.results || response.data.results.length === 0) {
                await sock.sendMessage(sender, { text: `⚠️ No images found for: *${query}*` });
                return;
            }

            // Send each image (up to 10)
            for (let i = 0; i < response.data.results.length; i++) {
                const img = response.data.results[i];
                await sock.sendMessage(sender, {
                    image: { url: img.urls.regular },
                    caption: `📸 *${query}* (Result ${i + 1})\nBy: ${img.user.name} (@${img.user.username})`
                });
            }
        } catch (error) {
            console.error("❌ Error in img.js:", error);
            await sock.sendMessage(sender, { text: "⚠️ Failed to fetch images. Please try again later." });
        }
    }
};
