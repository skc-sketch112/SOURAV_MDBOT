const axios = require("axios");

module.exports = {
    name: "pinterest",
    command: ["pinterest", "pin", "pint"],
    description: "Fetch Pinterest images by search query",

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

            // ✅ New stable API
            const url = `https://api.xyroinee.xyz/api/pinterest?text=${encodeURIComponent(query)}&apikey=free`;
            const res = await axios.get(url, { timeout: 20000 });

            if (!res.data || !res.data.data || res.data.data.length === 0) {
                return await sock.sendMessage(
                    m.key.remoteJid,
                    { text: "⚠️ No results found." },
                    { quoted: m }
                );
            }

            // 🎲 Random pick
            const image = res.data.data[Math.floor(Math.random() * res.data.data.length)];

            await sock.sendMessage(
                m.key.remoteJid,
                {
                    image: { url: image },
                    caption: `✨ Pinterest Result for: *${query}*`
                },
                { quoted: m }
            );

        } catch (err) {
            console.error("❌ Pinterest error:", err.message);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Error fetching images. API might be down. Try later." },
                { quoted: m }
            );
        }
    }
};
