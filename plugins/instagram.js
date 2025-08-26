const axios = require("axios");

module.exports = {
  name: "instagram",
  command: ["ig", "instagram"],
  description: "Download Instagram Video/Reel/Post",

  async execute(sock, m, args) {
    if (!args[0]) {
      return await sock.sendMessage(
        m.key.remoteJid,
        { text: "❌ Please provide a valid Instagram link.\n\nExample: .ig https://www.instagram.com/reel/xyz/" },
        { quoted: m }
      );
    }

    let url = args[0];

    try {
      // 🔹 Working free API (no key required)
      let api = `https://api.douyin.wtf/api?url=${encodeURIComponent(url)}`;

      let res = await axios.get(api);

      if (!res.data || !res.data.video) {
        return await sock.sendMessage(
          m.key.remoteJid,
          { text: "⚠️ Couldn't fetch the video. Try another Instagram link." },
          { quoted: m }
        );
      }

      let videoUrl = res.data.video;

      await sock.sendMessage(
        m.key.remoteJid,
        { video: { url: videoUrl }, caption: "✅ Downloaded from Instagram" },
        { quoted: m }
      );
    } catch (err) {
      console.error("Instagram plugin error:", err.message);
      await sock.sendMessage(
        m.key.remoteJid,
        { text: "❌ Error while fetching Instagram media. API might be down or link is invalid." },
        { quoted: m }
      );
    }
  },
};
