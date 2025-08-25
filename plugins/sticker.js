const { writeExif } = require("@whiskeysockets/baileys"); // built-in
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "sticker",
  command: ["sticker", "s", "st"],
  execute: async (sock, m, args) => {
    try {
      // 📸 Check if message has an image or video
      let quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      let type = quoted
        ? Object.keys(quoted)[0]
        : Object.keys(m.message)[0];

      if (!["imageMessage", "videoMessage", "stickerMessage"].includes(type)) {
        return sock.sendMessage(m.key.remoteJid, {
          text: "❌ Reply to an *image/video* with `.sticker`",
        }, { quoted: m });
      }

      // 📥 Download media
      const mediaPath = path.join(__dirname, "../downloads", `${Date.now()}`);
      if (!fs.existsSync(path.join(__dirname, "../downloads"))) {
        fs.mkdirSync(path.join(__dirname, "../downloads"));
      }

      const stream = await sock.downloadAndSaveMediaMessage(
        quoted ? { message: quoted } : m,
        mediaPath
      );

      // 🖼 Sticker metadata
      const packInfo = {
        packname: "SOURAV_MD",
        author: "BOT",
      };

      // ✨ Convert to sticker
      const stickerPath = `${mediaPath}.webp`;
      await writeExif(stream, packInfo, stickerPath);

      // 📤 Send sticker
      await sock.sendMessage(
        m.key.remoteJid,
        { sticker: { url: stickerPath } },
        { quoted: m }
      );

      // 🗑 Clean temp files
      fs.unlinkSync(stream);
      fs.unlinkSync(stickerPath);

    } catch (err) {
      console.error("Sticker error:", err);
      await sock.sendMessage(
        m.key.remoteJid,
        { text: "❌ Failed to make sticker. Try again." },
        { quoted: m }
      );
    }
  },
};
