const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
  name: "pinterest",
  alias: ["pin"],
  desc: "Search images from Pinterest",
  use: "<search term>",
  category: "search",
  
  async run({ msg, args }) {
    if (!args.length) {
      return msg.reply("❌ Usage: .pinterest <search term>\nExample: .pinterest cat");
    }

    const query = args.join(" ");
    await msg.reply(`🔍 Searching Pinterest for *${query}* ...`);

    try {
      const res = await axios.get(
        `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`
      );

      const $ = cheerio.load(res.data);
      let images = [];

      $("img").each((i, el) => {
        const src = $(el).attr("src");
        if (src && src.startsWith("http")) images.push(src);
      });

      if (images.length === 0) {
        return msg.reply("⚠️ No images found on Pinterest. Try another search.");
      }

      const randomImg = images[Math.floor(Math.random() * images.length)];

      await msg.bot.sendMessage(
        msg.from,
        { image: { url: randomImg }, caption: `✅ Pinterest result for: *${query}*` },
        { quoted: msg }
      );
    } catch (err) {
      console.error("Pinterest Error:", err.message);
      await msg.reply("❌ Failed to fetch Pinterest images. Please try again later.");
    }
  }
};
