const { Sticker, createSticker, StickerTypes } = require("wa-sticker-formatter");
const { default: axios } = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "sticker",
  command: ["sticker", "s", "st"],
  execute: async (sock, m, args) => {
    try {
      let buffer;

      // Case 1: User replied to an image/video
      if (m.message?.imageMessage || m.message?.videoMessage) {
        const msgType = m.message.imageMessage ? "image" : "video";
        const file = await sock.downloadMediaMessage(m);

        if (!file) {
          return sock.sendMessage(m.key.remoteJid, { text: "❌ Failed to download media." }, { quoted: m });
        }
        buffer = file;
      }

      // Case 2: User provided a direct URL
      else if (args[0] && args[0].startsWith("http")) {
        const url = args[0];
        const res = await axios.get(url, { responseType: "arraybuffer" });
        buffer = Buffer.from(res.data, "binary");
      }

      // Nothing provided
      else {
        return sock.sendMessage(m.key.remoteJid, { text: "⚠️ Reply to an *image/video* or send a *direct image URL* with `.sticker`" }, { quoted: m });
      }

      // Create sticker
      const sticker = new Sticker(buffer, {
        pack: "SOURAV_MD Pack",   // 👑 Pack name
        author: "SOURAV_MD",      // 👑 Your name
        type: StickerTypes.FULL,  // FULL / CROP / CIRCLE
        quality: 80,              // Sticker quality (max 100)
      });

      const stickerBuffer = await sticker.build();

      await sock.sendMessage(
        m.key.remoteJid,
        { sticker: stickerBuffer },
        { quoted: m }
      );
    } catch (err) {
      console.error("Sticker.js error:", err);
      await sock.sendMessage(
        m.key.remoteJid,
        { text: "❌ Error creating sticker. Try with a valid image/video." },
        { quoted: m }
      );
    }
  },
};
