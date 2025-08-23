const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
    name: "pinterest",
    command: ["pinterest", "pin", "pint"],
    description: "Fetch Pinterest images by scraping directly",

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

            // 🔥 Direct scrape from Pinterest search
            const url = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;
            const res = await axios.get(url, {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36"
                }
            });

            const $ = cheerio.load(res.data);

            // Extract image URLs from <img> tags
            let images = [];
            $("img").each((_, el) => {
                let img = $(el).attr("src");
                if (img && img.startsWith("http") && img.includes("pinimg.com")) {
                    images.push(img);
                }
            });

            if (images.length === 0) {
                return await sock.sendMessage(
                    m.key.remoteJid,
                    { text: "⚠️ No images found. Try another search." },
                    { quoted: m }
                );
            }

            // 🎲 Pick random image
            const image = images[Math.floor(Math.random() * images.length)];

            await sock.sendMessage(
                m.key.remoteJid,
                {
                    image: { url: image },
                    caption: `✨ Pinterest Result for: *${query}*`
                },
                { quoted: m }
            );

        } catch (err) {
            console.error("❌ Pinterest scraper error:", err.message);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Error fetching images. Pinterest may have changed layout." },
                { quoted: m }
            );
        }
    }
};
