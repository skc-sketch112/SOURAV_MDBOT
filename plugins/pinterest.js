const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
  name: "pinterest",
  alias: ["pin"],
  category: "search",
  desc: "Search images from Pinterest (direct scraper, no API)",
  use: "<query>",
  async run({ msg, args }) {
    if (!args.length) return msg.reply("❌ Usage: .pinterest <search term>");

    const query = args.join(" ");
    await msg.reply(`🔍 Searching Pinterest for *${query}* ...`);

    try {
      const url = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;
      const { data } = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/118.0.0.0 Safari/537.36"
        }
      });

      const $ = cheerio.load(data);
      let images = [];

      $("img").each((i, el) => {
        const src = $(el).attr("src");
        if (src && src.startsWith("https")) images.push(src);
      });

      if (images.length === 0) return msg.reply("⚠️ No images found. Try another keyword.");

      const randomImg = images[Math.floor(Math.random() * images.length)];

      await msg.bot.sendMessage(
        msg.from,
        { image: { url: randomImg }, caption: `✅ Pinterest result for: *${query}*` },
        { quoted: msg }
      );
    } catch (e) {
      console.error(e);
      return msg.reply("❌ Failed to fetch Pinterest images. Try again later.");
    }
  }
};
