const { writeFile } = require("fs/promises");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");

module.exports = {
  name: "sticker",
  command: ["sticker", "s"],

  async execute(sock, m, args) {
    try {
      const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const mime = quoted
        ? quoted.imageMessage
          ? "image"
          : quoted.videoMessage
          ? "video"
          : null
        : m.message?.imageMessage
        ? "image"
        : m.message?.videoMessage
        ? "video"
        : null;

      if (!mime) {
        return await sock.sendMessage(m.key.remoteJid, {
          text: "⚠️ Reply to an image/video with `.sticker`",
        });
      }

      const buffer = await sock.downloadMediaMessage(
        quoted ? { message: quoted } : m
      );

      const sticker = new Sticker(buffer, {
        pack: "MyBot",
        author: "StickerGen",
        type: StickerTypes.FULL,
      });

      const stickerBuffer = await sticker.build();
      await sock.sendMessage(m.key.remoteJid, { sticker: stickerBuffer }, { quoted: m });

    } catch (err) {
      console.error("Sticker plugin error:", err);
      await sock.sendMessage(
        m.key.remoteJid,
        { text: "❌ Failed to make sticker: " + err.message },
        { quoted: m }
      );
    }
  },
};
