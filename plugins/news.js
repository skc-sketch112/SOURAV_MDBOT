const fetch = require("node-fetch");

module.exports = {
    name: "news",
    command: ["news"],
    description: "Get unlimited latest news headlines from Google News",
    async execute(sock, m, args) {
        try {
            let topic = args.length > 0 ? args.join(" ") : "world"; // default: world news
            let url = `https://news.google.com/rss/search?q=${encodeURIComponent(topic)}&hl=en-IN&gl=IN&ceid=IN:en`;

            let res = await fetch(url);
            if (!res.ok) throw new Error("Failed to fetch news.");
            let xml = await res.text();

            // 📰 Extract titles & links using regex
            let items = [...xml.matchAll(/<item><title><!\[CDATA\[(.*?)\]\]><\/title><link>(.*?)<\/link>/g)]
                .map(match => ({ title: match[1], link: match[2] }));

            if (items.length === 0) {
                await sock.sendMessage(m.key.remoteJid, { text: "⚠️ No news found, try another topic." }, { quoted: m });
                return;
            }

            // 📋 Format unlimited news
            let newsText = `📰 *Latest News on ${topic.toUpperCase()}* 📰\n\n`;
            items.slice(0, 15).forEach((item, i) => {
                newsText += `*${i + 1}. ${item.title}*\n🔗 ${item.link}\n\n`;
            });

            await sock.sendMessage(m.key.remoteJid, { text: newsText }, { quoted: m });

        } catch (err) {
            console.error("❌ News error:", err);
            await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Failed to fetch news right now. Please try again later." }, { quoted: m });
        }
    }
};
