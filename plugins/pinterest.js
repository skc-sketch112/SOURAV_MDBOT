const axios = require("axios");

module.exports = {
    name: "pinterest",
    command: ["pinterest", "pin", "pint"],
    description: "Fetch Pinterest images using API",

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

            // ✅ Using public API instead of scraping
            const api = `https://pinterest-api-nine.vercel.app/?q=${encodeURIComponent(query)}`;
            const res = await axios.get(api);

            if (!res.data || res.data.length === 0) {
                return await sock.sendMessage(
                    m.key.remoteJid,
                    { text: "⚠️ No images found. Try another search." },
                    { quoted: m }
                );
            }

            // 🎲 Pick random image
            const image = res.data[Math.floor(Math.random() * res.data.length)];

            await sock.sendMessage(
                m.key.remoteJid,
                {
                    image: { url: image },
                    caption: `✨ Pinterest Result for: *${query}*`
                },
                { quoted: m }
            );

        } catch (err) {
            console.error("❌ Pinterest API error:", err.message);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Error fetching Pinterest images. API might be down." },
                { quoted: m }
            );
        }
    }
};
