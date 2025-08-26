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
        return await sock.sendMessage(m.key.remoteJid, {
          text: "⚠️ Please provide an Instagram link!\n\nExample: `.instagram https://www.instagram.com/reel/xyz/`"
        }, { quoted: m });
      }

      const url = args[0];
      const api = `https://instagramapi-fnwz.onrender.com/insta?url=${encodeURIComponent(url)}`;

      const { data } = await axios.get(api);

      if (!data || !data.url) {
        return await sock.sendMessage(m.key.remoteJid, {
          text: "❌ Failed to fetch media. Please check the link or try again later."
        }, { quoted: m });
      }

      // যদি ভিডিও হয়
      if (data.type === "video") {
        await sock.sendMessage(m.key.remoteJid, {
          video: { url: data.url },
          caption: "📥 Instagram Video Downloaded ✅"
        }, { quoted: m });
      } 
      // যদি ছবি হয়
      else if (data.type === "image") {
        await sock.sendMessage(m.key.remoteJid, {
          image: { url: data.url },
          caption: "📥 Instagram Image Downloaded ✅"
        }, { quoted: m });
      } 
      // অন্য কিছু হলে
      else {
        await sock.sendMessage(m.key.remoteJid, {
          text: "⚠️ Unsupported media type received."
        }, { quoted: m });
      }

    } catch (err) {
      console.error("Instagram Plugin Error:", err);
      await sock.sendMessage(m.key.remoteJid, {
        text: "❌ Error fetching Instagram media.\n" + err.message
      }, { quoted: m });
    }
  }
};
