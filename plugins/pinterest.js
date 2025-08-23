const axios = require("axios");
const cheerio = require("cheerio");

async function pinterestScraper(query) {
    try {
        const url = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;
        const { data } = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
        });

        const $ = cheerio.load(data);
        let images = [];

        // First try modern selector
        $("img").each((i, el) => {
            let src =
                $(el).attr("src") ||
                $(el).attr("data-src") ||
                $(el).attr("srcset");

            if (src && src.startsWith("http") && !src.includes("50x50")) {
                images.push(src.split(" ")[0]); // handle srcset
            }
        });

        images = [...new Set(images)]; // remove duplicates
        return images;
    } catch (err) {
        console.error("Pinterest scraper error:", err.message);
        return [];
    }
}

module.exports = {
    name: "pinterest",
    command: ["pinterest", "pin"],
    execute: async (sock, m, args) => {
        const query = args.join(" ");
        if (!query)
            return sock.sendMessage(
                m.key.remoteJid,
                {
                    text: "❌ Usage: .pinterest <search term>\nExample: .pinterest cat",
                },
                { quoted: m }
            );

        await sock.sendMessage(
            m.key.remoteJid,
            { text: `🔎 Searching Pinterest for *${query}* ...` },
            { quoted: m }
        );

        const results = await pinterestScraper(query);

        if (!results.length) {
            return sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ No images found on Pinterest." },
                { quoted: m }
            );
        }

        // send 3 random images
        const randomImgs = results.sort(() => 0.5 - Math.random()).slice(0, 3);
        for (let img of randomImgs) {
            await sock.sendMessage(
                m.key.remoteJid,
                { image: { url: img }, caption: `Result for *${query}*` },
                { quoted: m }
            );
        }
    },
};
