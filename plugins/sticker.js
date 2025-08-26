const { Sticker, StickerTypes } = require("wa-sticker-formatter");

module.exports = {
  name: "sticker",
  alias: ["s"],
  desc: "Convert image or short video to sticker",
  category: "converter",
  async exec({ m, sock }) {
    try {
      // Must reply to an image or video
      if (
        !m.quoted ||
        !(
          m.quoted.mtype === "imageMessage" ||
          m.quoted.mtype === "videoMessage"
        )
      ) {
        return m.reply("⚠️ Reply to an image/video (max 10s) with .sticker");
      }

      // Download media buffer
      const buffer = await m.quoted.download();
      if (!buffer) return m.reply("❌ Failed to download media.");

      // Create sticker
      const sticker = new Sticker(buffer, {
        pack: "SOURAVMD",        // sticker pack name
        author: "WhatsApp Bot",  // sticker author
        type: StickerTypes.FULL, // full image (not cropped)
        quality: 80,             // quality (0-100)
      });

      // Send sticker
      const stickerBuffer = await sticker.toBuffer();
      await sock.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m });

    } catch (err) {
      console.error("Sticker error:", err);
      m.reply("❌ Could not create sticker. Try with another image/video.");
    }
  },
};
