const fetch = require("node-fetch");
const xml2js = require("xml2js");

module.exports = {
    name: "news",
    command: ["news"],
    description: "Get the latest news headlines (unlimited queries)",

    execute: async (sock, m, args) => {
        try {
            const query = args.length > 0 ? args.join(" ") : "world";
            const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`;

            // Fetch RSS
            const response = await fetch(url);
            const xml = await response.text();

            // Parse XML
            const result = await xml2js.parseStringPromise(xml);

            const items = result.rss.channel[0].item || [];
            if (items.length === 0) {
                return await sock.sendMessage(m.key.remoteJid, { text: "⚠️ No news found right now." }, { quoted: m });
            }

            // Format first 10 news headlines
            let newsList = `📰 *Latest News on ${query}* 📰\n\n`;
            items.slice(0, 10).forEach((item, i) => {
                newsList += `🔹 *${i + 1}. ${item.title[0]}*\n🔗 ${item.link[0]}\n\n`;
            });

            await sock.sendMessage(m.key.remoteJid, { text: newsList }, { quoted: m });

        } catch (err) {
            console.error("❌ News fetch error:", err);
            await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Failed to fetch news. Please try again later." }, { quoted: m });
        }
    }
};
