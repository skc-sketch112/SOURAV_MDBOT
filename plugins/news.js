const fetch = require("node-fetch");

module.exports = {
  name: "news",
  command: ["news", "headline", "updates"],
  description: "Get latest unlimited free news headlines",

  execute: async (sock, m, args) => {
    const jid = m.key.remoteJid;
    let query = args.join(" ") || "latest";

    try {
      let articles = [];

      // 1️⃣ Try GNews API (free mirror)
      try {
        const gnewsURL = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&token=1f3b13da8f2f3d77e6e6d8c2`;
        const res = await safeFetch(gnewsURL, 8000);
        const data = await res.json();
        if (data && data.articles && data.articles.length > 0) {
          articles = data.articles.map(a => ({
            title: a.title,
            url: a.url,
            desc: a.description || ""
          }));
        }
      } catch (e) {
        console.log("⚠️ GNews failed, trying fallback...");
      }

      // 2️⃣ Fallback: Inshorts API (community)
      if (articles.length === 0) {
        try {
          const res = await safeFetch(`https://inshortsapi.vercel.app/news?category=${query}`, 8000);
          const data = await res.json();
          if (data && data.data && data.data.length > 0) {
            articles = data.data.map(a => ({
              title: a.title,
              url: a.url,
              desc: a.content || ""
            }));
          }
        } catch (e) {
          console.log("⚠️ Inshorts failed, trying fallback...");
        }
      }

      // 3️⃣ Fallback: Reddit RSS News
      if (articles.length === 0) {
        try {
          const res = await safeFetch("https://www.reddit.com/r/news/.json?limit=10", 8000);
          const data = await res.json();
          if (data && data.data && data.data.children) {
            articles = data.data.children.map(c => ({
              title: c.data.title,
              url: `https://reddit.com${c.data.permalink}`,
              desc: ""
            }));
          }
        } catch (e) {
          console.log("⚠️ Reddit fallback also failed...");
        }
      }

      if (articles.length === 0) {
        await sock.sendMessage(jid, { text: "⚠️ Couldn’t fetch news right now. Try again later." }, { quoted: m });
        return;
      }

      // Format response
      let text = `📰 *Top ${query} News*\n\n`;
      articles.slice(0, 7).forEach((a, i) => {
        text += `*${i + 1}. ${a.title}*\n${a.desc ? a.desc + "\n" : ""}🔗 ${a.url}\n\n`;
      });

      await sock.sendMessage(jid, { text }, { quoted: m });

    } catch (err) {
      console.error("❌ News error:", err);
      await sock.sendMessage(jid, { text: "⚠️ Error fetching news. Try again later." }, { quoted: m });
    }
  }
};

/* -------------------- Helpers -------------------- */
async function safeFetch(url, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
}
