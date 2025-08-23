const axios = require("axios");

module.exports = {
  name: "pinterest",
  alias: ["pin"],
  category: "search",
  desc: "Search images from Pinterest",
  use: "<search term>",
  async run({ msg, args }) {
    if (!args.length) {
      return msg.reply("❌ Usage: .pinterest <search term>\nExample: .pinterest cat");
    }

    const query = args.join(" ");
    await msg.reply(`🔍 Searching Pinterest for *${query}* ...`);

    // Multiple APIs (backup system)
    const apis = [
      `https://api.akuari.my.id/search/pinterest?query=${encodeURIComponent(query)}`,
      `https://bx-hunter.herokuapp.com/api/pinterest?text=${encodeURIComponent(query)}&apikey=Ikyy69`, 
      `https://vihangayt.me/search/pinterest?q=${encodeURIComponent(query)}`
    ];

    let images = [];

    for (let api of apis) {
      try {
        const res = await axios.get(api, { timeout: 10000 });
        if (res.data) {
          if (res.data.result) images = res.data.result;
          else if (res.data.data) images = res.data.data;
          else if (res.data.image) images = res.data.image;
        }
        if (images && images.length > 0) break; // ✅ got results, stop loop
      } catch (e) {
        console.log(`⚠️ API failed: ${api}`);
      }
    }

    if (!images || images.length === 0) {
      return msg.reply("⚠️ No images found or all APIs down. Try again later.");
    }

    const randomImg = images[Math.floor(Math.random() * images.length)];

    await msg.bot.sendMessage(
      msg.from,
      { image: { url: randomImg }, caption: `✅ Pinterest result for: *${query}*` },
      { quoted: msg }
    );
  }
};
