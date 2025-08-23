const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
    name: "pinterest",
    command: ["pinterest", "pin"],
    execute: async (sock, m, args) => {
        if (!args.length) {
            return sock.sendMessage(
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

        try {
            const url = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;
            const res = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });

            const $ = cheerio.load(res.data);
            let images = [];

            $("img").each((i, el) => {
                let img = $(el).attr("src");
                if (img && img.startsWith("http")) {
                    images.push(img);
                }
            });

            if (images.length === 0) {
                return sock.sendMessage(
                    m.key.remoteJid,
                    { text: "⚠️ No images found on Pinterest." },
                    { quoted: m }
                );
            }

            const randomImg = images[Math.floor(Math.random() * images.length)];

            await sock.sendMessage(
                m.key.remoteJid,
                { image: { url: randomImg }, caption: `✅ Pinterest result for: *${query}*` },
                { quoted: m }
            );
        } catch (e) {
            console.error(e);
            return sock.sendMessage(
                m.key.remoteJid,
                { text: "❌ Error fetching Pinterest results. Try again later." },
                { quoted: m }
            );
        }
    }
};
