const { writeFile } = require("fs");
const { Sticker } = require("wa-sticker-formatter");

module.exports = {
  name: "sticker",
  alias: ["s"],
  desc: "Convert image/video to sticker",
  category: "converter",
  async exec({ m, sock }) {
    try {
      // Check reply ache kina
      if (!m.quoted || !(m.quoted.mtype === "imageMessage" || m.quoted.mtype === "videoMessage")) {
        return m.reply("⚠️ Reply to an image/video (max 10s) with .sticker");
      }

      let buffer = await m.quoted.download(); // Download media

      // Sticker object
      let sticker = new Sticker(buffer, {
        pack: "SOURAVMD",
        author: "WhatsApp Bot",
        type: "full",
        quality: 70,
      });

      // Send as sticker
      const stickerBuffer = await sticker.toBuffer();
      await sock.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m });

    } catch (e) {
      console.error(e);
      m.reply("❌ Failed to create sticker, try again.");
    }
  }
};
