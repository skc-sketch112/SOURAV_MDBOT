const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
  name: "google",
  alias: ["gsearch", "goog"],
  desc: "Search the web (Free, unlimited) and get results",
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

    try {
      const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
      const { data } = await axios.get(searchUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
      const $ = cheerio.load(data);

      const results = [];
      $("li.b_algo h2 a").each((i, el) => {
        if (i >= 10) return; // limit to 10 results
        results.push({
          title: $(el).text(),
          url: $(el).attr("href")
        });
      });

      if (!results.length) return sendText("❌ No results found.");

      let msgText = `🔎 Search Results for *${query}*:\n\n`;
      results.forEach((r, i) => {
        msgText += `*${i + 1}.* ${r.title}\n${r.url}\n\n`;
      });

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
