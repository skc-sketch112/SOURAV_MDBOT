const axios = require("axios");

module.exports = {
  name: "instagram",
  alias: ["ig","insta"],
  desc: "Download Instagram Video/Reel",
  type: "downloader",
  async exec(m, { sock, args }) {
    try {
      if (!args[0]) return m.reply("📌 দয়া করে একটা Instagram লিংক দাও!");

      // Clean the URL (remove ?igsh= or extra query params)
      let url = args[0].split("?")[0];

      // তোমার Render API URL
      let api = `https://instagramapi-fnwz.onrender.com/api/insta?url=${encodeURIComponent(url)}`;

      let res = await axios.get(api);

      if (!res.data || !res.data.result) {
        return m.reply("❌ Failed to fetch Instagram media!");
      }

      // যদি একাধিক media থাকে
      for (let media of res.data.result) {
        await sock.sendMessage(m.chat, { video: { url: media.url }, caption: "✅ Instagram Downloaded" }, { quoted: m });
      }

    } catch (e) {
      console.log(e);
      m.reply("❌ Error fetching Instagram media.");
    }
  }
};
