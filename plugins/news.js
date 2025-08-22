const fetch = require("node-fetch");

module.exports = {
  name: "news",
  command: ["news", "headlines"],
  description: "Get latest headlines (free, no key) with fallback if a source is down",

  execute: async (sock, m, args) => {
    const jid = m.key.remoteJid;

    // Parse args: category + count (e.g., ".news world 7")
    let categoryRaw = (args[0] || "world").toLowerCase();
    let count = Math.min(Math.max(parseInt(args[1]) || 5, 1), 10); // 1..10

    // Category help
    if (categoryRaw === "categories" || categoryRaw === "cats" || categoryRaw === "help") {
      const list = [
        "world", "national", "business", "sports", "technology", "entertainment",
        "science", "automobile", "politics", "startup", "miscellaneous", "hatke"
      ];
      const msg = `📰 *News Categories*\n\n${list.map(c => `• ${c}`).join("\n")}\n\n` +
                  `Try: .news world 7`;
      await sock.sendMessage(jid, { text: msg }, { quoted: m });
      return;
    }

    // Map some friendly aliases
    const aliases = {
      tech: "technology",
      sci: "science",
      biz: "business",
      ent: "entertainment",
      auto: "automobile",
      misc: "miscellaneous",
    };
    const category = aliases[categoryRaw] || categoryRaw;

    try {
      // 1) PRIMARY: Inshorts (public JSON mirror)
      // Example: https://inshorts.deta.dev/news?category=world
      const primaryURL = `https://inshorts.deta.dev/news?category=${encodeURIComponent(category)}`;
      const primaryRes = await safeFetch(primaryURL, 9000);
      if (primaryRes.ok) {
        const data = await primaryRes.json();
        if (data?.success && Array.isArray(data?.data) && data.data.length) {
          const items = data.data.slice(0, count);
          const lines = items.map((it, i) => {
            const title = it.title || "Untitled";
            const source = it.author ? ` — ${it.author}` : "";
            const link = it.readMoreUrl || it.url || "";
            return `*${i + 1}.* ${title}${source}\n${link}`;
          });
          const header = `🗞️ *Top ${capitalize(category)} Headlines* (${items.length})\n`;
          await sock.sendMessage(jid, { text: `${header}\n${lines.join("\n\n")}` }, { quoted: m });
          return;
        }
      }

      // 2) FALLBACK: Hacker News (official, no key)
      // top stories -> fetch item details
      const topURL = "https://hacker-news.firebaseio.com/v0/topstories.json";
      const topRes = await safeFetch(topURL, 9000);
      if (!topRes.ok) throw new Error("HN top stories failed");
      const ids = (await topRes.json()).slice(0, Math.max(count, 10)); // fetch a little extra
      const items = await fetchHNItems(ids, count);

      if (items.length) {
        const header = `👨‍💻 *Top Tech Headlines* (Fallback) (${items.length})\n`;
        const lines = items.map((it, i) => {
          const title = it.title || "Untitled";
          const link = it.url || `https://news.ycombinator.com/item?id=${it.id}`;
          return `*${i + 1}.* ${title}\n${link}`;
        });
        await sock.sendMessage(jid, { text: `${header}\n${lines.join("\n\n")}` }, { quoted: m });
        return;
      }

      throw new Error("No items from both sources");
    } catch (err) {
      console.error("❌ News plugin error:", err);
      await sock.sendMessage(
        jid,
        { text: "⚠️ Unable to fetch news right now. Please try again in a moment." },
        { quoted: m }
      );
    }
  },
};

/* -------------------- Helpers -------------------- */

// Fetch with timeout
async function safeFetch(url, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
}

// Fetch Hacker News items (title + url)
async function fetchHNItems(ids, needCount) {
  const itemURL = (id) => `https://hacker-news.firebaseio.com/v0/item/${id}.json`;
  const results = [];
  for (const id of ids) {
    if (results.length >= needCount) break;
    try {
      const res = await safeFetch(itemURL(id), 8000);
      if (!res.ok) continue;
      const data = await res.json();
      if (data && data.title) results.push({ id, title: data.title, url: data.url || "" });
    } catch (_) {
      // skip failed item
    }
  }
  return results.slice(0, needCount);
}

function capitalize(s = "") {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
