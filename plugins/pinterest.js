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
                    { text: "❌ Usage: .pinterest <search term>\n\nExample: `.pinterest anime girl`" },
                    { quoted: m }
                );
            }

            const query = args.join(" ");
            await sock.sendMessage(m.key.remoteJid, { text: `🔍 Searching Pinterest for *${query}* ...` }, { quoted: m });

            // 🔗 Pinterest scraper API (no key required, free & stable)
            const url = `https://pinterest-api-one.vercel.app/?q=${encodeURIComponent(query)}`;

            const res = await axios.get(url, { timeout: 20000 });
            
            if (!res.data || !Array.isArray(res.data) || res.data.length === 0) {
                return await sock.sendMessage(m.key.remoteJid, { text: "⚠️ No results found." }, { quoted: m });
            }

            // Pick a random image from results
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
            console.error("❌ Pinterest command error:", err.message || err);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Failed to fetch from Pinterest. Try again later." },
                { quoted: m }
            );
        }
    }
};
