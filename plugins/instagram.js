// =============== INSTAGRAM DOWNLOADER PLUGIN ===============
// Command: .instagram <link>
// Author: SOURAV_MD

const axios = require("axios");

module.exports = {
  name: "instagram",
  command: ["instagram", "insta", "ig"],

  async execute(sock, m, args) {
    try {
      if (!args[0]) {
        return await sock.sendMessage(
          m.key.remoteJid,
          {
            text: "⚠️ Please provide an Instagram link!\n\nExample: `.instagram https://www.instagram.com/reel/xyz/`",
          },
          { quoted: m }
        );
      }

      const url = args[0];
      // ✅ Working API
      const api = `https://raganork-api.vercel.app/api/igdl?url=${encodeURIComponent(url)}`;

      const { data } = await axios.get(api);

      if (!data || !data.result || data.result.length === 0) {
        return await sock.sendMessage(
          m.key.remoteJid,
          { text: "❌ Failed to fetch media. Please check the link or try again later." },
          { quoted: m }
        );
      }

      // একাধিক মিডিয়া থাকলে সব পাঠাবে
      for (let item of data.result) {
        if (item.type === "video") {
          await sock.sendMessage(
            m.key.remoteJid,
            {
              video: { url: item.url },
              caption: "📥 Instagram Video Downloaded ✅",
            },
            { quoted: m }
          );
        } else if (item.type === "image") {
          await sock.sendMessage(
            m.key.remoteJid,
            {
              image: { url: item.url },
              caption: "📥 Instagram Image Downloaded ✅",
            },
            { quoted: m }
          );
        }
      }
    } catch (err) {
      console.error("Instagram Plugin Error:", err);
      await sock.sendMessage(
        m.key.remoteJid,
        {
          text: "❌ Error fetching Instagram media.\n" + err.message,
        },
        { quoted: m }
      );
    }
  },
};
