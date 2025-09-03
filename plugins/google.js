const ddg = require("duckduckgo-search");

module.exports = {
  name: "google",
  alias: ["gsearch", "goog"],
  desc: "Search Google (DuckDuckGo free) and get unlimited results",
  category: "search",
  usage: ".google <query>",

  async execute(sock, msg, args) {
    if (!args.length) {
      return sock.sendMessage(
        msg.key.remoteJid,
        { text: "⚠️ Usage: `.google <query>`" },
        { quoted: msg }
      );
    }

    const query = args.join(" ");
    const sendText = async (text) => sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });

    // Send initial loader message
    const sentMsg = await sendText(`⏳ Searching for: *${query}* ...`);

    // Loader animation frames
    const frames = [
      `⏳ Searching for: *${query}* .`,
      `⏳ Searching for: *${query}* ..`,
      `⏳ Searching for: *${query}* ...`,
      `⏳ Searching for: *${query}* ....`
    ];

    for (let i = 0; i < 8; i++) {
      await new Promise(r => setTimeout(r, 400));
      await sock.sendMessage(msg.key.remoteJid, {
        edit: sentMsg.key,
        text: frames[i % frames.length]
      });
    }

    try {
      // Perform DuckDuckGo search
      const results = await ddg.search(query, { moderate: true, retries: 2, max_results: 10 });

      if (!results || results.length === 0) {
        return sendText("❌ No results found.");
      }

      // Build message text
      let msgText = `🔎 Search Results for *${query}*:\n\n`;
      results.forEach((r, i) => {
        msgText += `*${i + 1}.* ${r.title}\n${r.snippet || ""}\n${r.url}\n\n`;
      });

      // Send final results
      await sock.sendMessage(msg.key.remoteJid, {
        edit: sentMsg.key,
        text: msgText
      });

    } catch (err) {
      console.error("Search error:", err);
      await sendText("❌ Failed to fetch results. Try again.");
    }
  }
};
