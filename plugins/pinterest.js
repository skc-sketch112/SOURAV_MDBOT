const axios = require("axios");

module.exports = {
    name: "pinterest",
    command: ["pinterest", "pin"],
    description: "Fetch images from Pinterest",

    async execute(sock, m, args) {
        try {
            if (!args || args.length === 0) {
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

            // ✅ API endpoint
            const res = await axios.get(
                `https://shizoapi.vercel.app/api/pinterest?query=${encodeURIComponent(query)}`
            );

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
                    caption: `✨ Pinterest result for: *${query}*`
                },
                { quoted: m }
            );

        } catch (err) {
            console.error("Pinterest Plugin Error:", err);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Error fetching Pinterest images. Try again later." },
                { quoted: m }
            );
        }
    }
};
