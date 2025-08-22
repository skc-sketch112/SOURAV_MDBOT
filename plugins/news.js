const fetch = require("node-fetch");
const Parser = require("rss-parser");
const parser = new Parser();

module.exports = {
    name: "news",
    command: ["news", "headlines"],
    description: "Get latest news headlines from multiple sources",

    execute: async (sock, m, args) => {
        try {
            // 🌍 Multiple news RSS sources
            const feeds = [
                "http://feeds.bbci.co.uk/news/rss.xml", // BBC
                "https://rss.cnn.com/rss/edition.rss", // CNN
                "https://www.aljazeera.com/xml/rss/all.xml", // Al Jazeera
                "https://feeds.a.dj.com/rss/RSSWorldNews.xml", // Wall Street Journal
                "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml" // NYT
            ];

            let headlines = [];

            // Fetch from all sources
            for (const feed of feeds) {
                try {
                    let data = await parser.parseURL(feed);
                    data.items.slice(0, 3).forEach(item => { // 3 per source
                        headlines.push(`📰 *${item.title}*\n🔗 ${item.link}`);
                    });
                } catch (err) {
                    console.error("Failed to fetch from:", feed, err.message);
                }
            }

            if (headlines.length === 0) {
                await sock.sendMessage(m.key.remoteJid, { text: "⚠️ No news available right now, try again later." }, { quoted: m });
                return;
            }

            // 📢 Format final news text
            const newsText = `🌍 *Latest News Updates* 🌍\n\n${headlines.join("\n\n")}`;

            await sock.sendMessage(
                m.key.remoteJid,
                { text: newsText },
                { quoted: m }
            );

        } catch (err) {
            console.error("❌ News error:", err);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Failed to fetch news, please try again later." },
                { quoted: m }
            );
        }
    }
};
