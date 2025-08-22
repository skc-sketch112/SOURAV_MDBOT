const fetch = require("node-fetch");
const { parseStringPromise } = require("xml2js");

module.exports = {
  name: "news",
  command: ["news", "headlines", "latestnews"],
  description: "Unlimited free news without API key (Google News RSS)",

  execute: async (sock, m, args) => {
    const jid = m.key.remoteJid;

    let query = args.join(" ").trim();
    let feedUrl;

    if (query) {
      // Search-based feed
      feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`;
    } else {
      // Top headlines feed
      feedUrl = `https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en`;
    }

    try {
      const res = await fetch(feedUrl, { timeout: 15000 });
      if (!res.ok) throw new Error("Bad response from News RSS");
      const xml = await res.text();

      // Parse RSS XML
      const json = await parseStringPromise(xml, { explicitArray: false });
      const items = json.rss.channel.item;

      if (!items || items.length === 0) {
        await sock.sendMessage(jid, { text: "❌ No news found right now." }, { quoted: m });
        return;
      }

      // Pick top 6 articles
      const topNews = (Array.isArray(items) ? items : [items]).slice(0, 6);

      let caption = `📰 *Latest News${query ? " on " + query : ""}*\n\n`;
      topNews.forEach((n, i) => {
        caption += `*${i + 1}. ${n.title}*\n${n.link}\n\n`;
      });

      await sock.sendMessage(jid, { text: caption.trim() }, { quoted: m });

    } catch (err) {
      console.error("❌ News plugin error:", err);
      await sock.sendMessage(jid, { text: "⚠️ Could not fetch news right now. Please try again." }, { quoted: m });
    }
  }
};
