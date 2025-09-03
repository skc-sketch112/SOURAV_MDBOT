const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
  name: "google",
  alias: ["gsearch", "goog"],
  desc: "Search Google and get unlimited results directly",
  category: "search",
  usage: ".google <search query>",

  async execute(sock, msg, args) {
    if (!args.length) {
      return sock.sendMessage(
        msg.key.remoteJid,
        { text: "⚠️ Usage: `.google <search query>`" },
        { quoted: msg }
      );
    }

    const query = args.join(" ");
    const sendText = async (text) => sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });

    const sentMsg = await sendText(`⏳ Searching Google for: *${query}* ...`);

    try {
      // Encode the query for URL
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=10`;

      // Make HTTP GET request
      const { data } = await axios.get(searchUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36"
        }
      });

      // Load HTML with Cheerio
      const $ = cheerio.load(data);
      const results = [];

      $("div.g").each((i, el) => {
        const title = $(el).find("h3").text();
        const link = $(el).find("a").attr("href");
        const desc = $(el).find(".VwiC3b").text();

        if (title && link) results.push({ title, link, desc });
      });

      if (!results.length) return sendText("❌ No results found.");

      // Build message text
      let msgText = `🔎 Google Search Results for *${query}*:\n\n`;
      results.forEach((r, i) => {
        msgText += `*${i + 1}.* ${r.title}\n${r.desc || ""}\n${r.link}\n\n`;
      });

      await sock.sendMessage(msg.key.remoteJid, {
        edit: sentMsg.key,
        text: msgText
      });

    } catch (err) {
      console.error("Google search error:", err);
      return sendText("❌ Failed to fetch Google results. Try again.");
    }
  },
};
