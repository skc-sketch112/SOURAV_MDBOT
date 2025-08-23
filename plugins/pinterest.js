const axios = require("axios");

module.exports = {
    name: "pinterest",
    command: ["pinterest", "pin"],
    description: "Fetch Pinterest images by scraping",

    async execute(sock, m, args) {
        try {
            if (!args || args.length < 1) {
                return await sock.sendMessage(
                    m.key.remoteJid,
                    { text: "❌ Usage: .pinterest <search term>\nExample: .pinterest cat" },
                    { quoted: m }
                );
            }

            const query = args.join(" ");
            await sock.sendMessage(
                m.key.remoteJid,
                { text: `🔍 Searching Pinterest for *${query}* ...` },
                { quoted: m }
            );

            // ✅ Scrape Pinterest search page
            const url = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;
            const { data } = await axios.get(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0"
                }
            });

            // Extract image links from page
            const regex = /"url":"(https:\/\/i\.pinimg\.com\/[^"]+)"/g;
            let results = [];
            let match;

            while ((match = regex.exec(data)) !== null) {
                results.push(match[1].replace(/\\u0026/g, "&"));
            }

            if (results.length === 0) {
                return await sock.sendMessage(
                    m.key.remoteJid,
                    { text: "⚠️ No images found. Try another search." },
                    { quoted: m }
                );
            }

            // 🎲 Pick a random image
            const image = results[Math.floor(Math.random() * results.length)];

            await sock.sendMessage(
                m.key.remoteJid,
                {
                    image: { url: image },
                    caption: `✨ Pinterest result for: *${query}*`
                },
                { quoted: m }
            );

        } catch (err) {
            console.error("Pinterest Error:", err.message);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Error fetching Pinterest images. Try again later." },
                { quoted: m }
            );
        }
    }
};
