// plugins/img.js
const axios = require("axios");

// Put your Unsplash API key here (or better: in environment variable)
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || "Uebb0QGhkVela_0V0ZidmqYXDqAEHRYpV2UnemVHgLY";

module.exports = {
    name: "img",
    description: "Fetch images from Unsplash API",
    execute: async (sock, msg, args) => {
        const sender = msg.key.remoteJid;

        if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY === "Uebb0QGhkVela_0V0ZidmqYXDqAEHRYpV2UnemVHgLY") {
            return sock.sendMessage(sender, { text: "⚠️ Unsplash API key missing. Please set it in `img.js`." });
        }

        // Default query + count
        let query = "random";
        let count = 1;

        if (args.length > 0) {
            const lastArg = args[args.length - 1];
            if (!isNaN(lastArg)) {
                count = Math.min(parseInt(lastArg), 10); // allow max 10 images
                args.pop();
            }
            if (args.length > 0) query = args.join(" ");
        }

        try {
            const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&client_id=${UNSPLASH_ACCESS_KEY}`;
            const res = await axios.get(url);

            if (!res.data.results || res.data.results.length === 0) {
                return sock.sendMessage(sender, { text: `❌ No images found for "${query}".` });
            }

            // Send each image
            for (let i = 0; i < res.data.results.length; i++) {
                const img = res.data.results[i];
                await sock.sendMessage(sender, {
                    image: { url: img.urls.regular },
                    caption: `🖼️ Result ${i + 1}/${res.data.results.length} for "${query}"\n📸 By: ${img.user.name}`
                });
            }
        } catch (err) {
            console.error("❌ Error fetching Unsplash images:", err);
            await sock.sendMessage(sender, { text: "⚠️ Failed to fetch images from Unsplash API." });
        }
    }
};
