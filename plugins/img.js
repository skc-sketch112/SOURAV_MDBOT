const axios = require("axios");

// 🔑 Replace this with your real Unsplash API key
const UNSPLASH_ACCESS_KEY = "Uebb0QGhkVela_0V0ZidmqYXDqAEHRYpV2UnemVHgLY";

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
        if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY === "const UNSPLASH_ACCESS_KEY = "Uebb0QGhkVela_0V0ZidmqYXDqAEHRYpV2UnemVHgLY") {
            await sock.sendMessage(sender, {
                text: "⚠️ Unsplash API key is missing!\nPlease set it in `img.js` before using this command."
            });
            return;
        }

        try {
            const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=10&client_id=${UNSPLASH_ACCESS_KEY}`;
            const response = await axios.get(url);

            const results = response.data.results;
            if (!results || results.length === 0) {
                await sock.sendMessage(sender, {
                    text: `⚠️ No images found for: *${query}*`
                });
                return;
            }

            // ✅ Send up to 10 images
            for (let i = 0; i < results.length; i++) {
                const img = results[i];
                await sock.sendMessage(sender, {
                    image: { url: img.urls.regular },
                    caption: `📸 *${query}* (Result ${i + 1})\n👤 By: ${img.user.name} (@${img.user.username || "unknown"})`
                });
            }
        } catch (error) {
            console.error("❌ Error in img.js:", error.message || error);
            await sock.sendMessage(sender, {
                text: "⚠️ Failed to fetch images from Unsplash. Try again later."
            });
        }
    }
};
