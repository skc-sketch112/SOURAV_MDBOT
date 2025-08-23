const axios = require("axios");

module.exports = {
    name: "pinterest",
    command: ["pinterest", "pin", "pint"],
    description: "Search images (Pinterest style)",

    async execute(sock, m, args) {
        let query = args.join(" ");
        if (!query) {
            return sock.sendMessage(m.key.remoteJid, { text: "❌ Please provide a search term!\n\nExample: .pinterest anime girl" }, { quoted: m });
        }

        try {
            // DuckDuckGo image search API
            let { data } = await axios.get(
                `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}`
            );

            if (!data.results || !data.results.length) {
                return sock.sendMessage(m.key.remoteJid, { text: "⚠️ No images found!" }, { quoted: m });
            }

            // Pick random image
            let result = data.results[Math.floor(Math.random() * data.results.length)];
            let image = result.image;

            await sock.sendMessage(
                m.key.remoteJid,
                { image: { url: image }, caption: `🔍 Image result for: *${query}*` },
                { quoted: m }
            );

        } catch (err) {
            console.error("❌ Image Fetch Error:", err.message);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Failed to fetch images, please try again later." },
                { quoted: m }
            );
        }
    }
};
