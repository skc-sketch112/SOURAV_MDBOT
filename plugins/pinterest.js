const axios = require("axios");

module.exports = {
    name: "pinterest",
    command: ["pinterest", "pin"],
    description: "Search Pinterest images",
    async execute(sock, m, args) {
        if (!args.length) {
            return sock.sendMessage(
                m.key.remoteJid,
                { text: "❌ Usage: .pinterest <search term>\nExample: .pinterest cat" },
                { quoted: m }
            );
        }

        const query = args.join(" ");
        const apiKey = process.env.SERPAPI_KEY; // 🔑 From Render Environment

        if (!apiKey) {
            return sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Missing SerpAPI key. Please set SERPAPI_KEY in environment." },
                { quoted: m }
            );
        }

        await sock.sendMessage(
            m.key.remoteJid,
            { text: `🔍 Searching Pinterest for *${query}* ...` },
            { quoted: m }
        );

        try {
            const url = `https://serpapi.com/search.json?engine=pinterest&q=${encodeURIComponent(query)}&api_key=${apiKey}`;
            const res = await axios.get(url);

            let images = [];
            if (res.data && res.data.pins) {
                images = res.data.pins.map(pin => pin.images?.orig?.url).filter(Boolean);
            }

            if (!images || images.length === 0) {
                return sock.sendMessage(
                    m.key.remoteJid,
                    { text: "⚠️ No images found. Try another keyword." },
                    { quoted: m }
                );
            }

            // Pick random image
            const randomImg = images[Math.floor(Math.random() * images.length)];

            await sock.sendMessage(
                m.key.remoteJid,
                { image: { url: randomImg }, caption: `✅ Pinterest result for: *${query}*` },
                { quoted: m }
            );
        } catch (err) {
            console.error("❌ Pinterest error:", err.message);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "❌ Error fetching from Pinterest API." },
                { quoted: m }
            );
        }
    }
};
