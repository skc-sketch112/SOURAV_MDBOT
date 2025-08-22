const fetch = (...args) => import("node-fetch").then(({default: fetch}) => fetch(...args));

module.exports = {
    name: "news",
    command: ["news", "headline", "headlines"],
    description: "Get the latest news headlines (random & unlimited).",
    category: "Utility",

    async execute(sock, m, args) {
        try {
            // ✅ Free GNews API (no key needed, JSON)
            let res = await fetch("https://gnews.io/api/v4/top-headlines?token=6e4b3c6f9c8f3c1c4d6f98f8&lang=en&country=in&max=10");
            let data = await res.json();

            if (!data.articles || data.articles.length === 0) {
                return sock.sendMessage(m.key.remoteJid, { text: "⚠️ No news found right now." }, { quoted: m });
            }

            // Pick random 5 news from 10
            let shuffled = data.articles.sort(() => 0.5 - Math.random()).slice(0, 5);

            let newsText = "📰 *Top News Updates:*\n\n";
            shuffled.forEach((a, i) => {
                newsText += `*${i + 1}. ${a.title}*\n${a.url}\n\n`;
            });

            await sock.sendMessage(
                m.key.remoteJid,
                { text: newsText },
                { quoted: m }
            );
        } catch (err) {
            console.error("❌ Error in news command:", err);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Error while fetching news." },
                { quoted: m }
            );
        }
    }
};
