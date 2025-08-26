const { Sticker, StickerTypes } = require("wa-sticker-formatter");

module.exports = {
  name: "sticker",
  command: ["sticker", "s", "st"],
  execute: async (sock, m, args) => {
    try {
      let quoted = m.quoted ? m.quoted : m; // reply করা msg নাকি নিজের msg চেক করা
      let mime = (quoted.msg || quoted).mimetype || "";

      if (!/image|video/.test(mime)) {
        return sock.sendMessage(
          m.chat,
          { text: "❌ Reply an *image/video (max 10s)* বা send one with `.sticker`" },
          { quoted: m }
        );
      }

      // ডাউনলোড মিডিয়া
      let buffer = await quoted.download();

      if (!buffer) {
        return sock.sendMessage(
          m.chat,
          { text: "⚠️ Media download failed, try again!" },
          { quoted: m }
        );
      }

      // স্টিকার বানানো
      let sticker = new Sticker(buffer, {
        pack: "🔥 My Pack",
        author: "My Bot",
        type: StickerTypes.FULL,
        quality: 80,
      });

      let stickerBuffer = await sticker.build();

      await sock.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m });

    } catch (e) {
      console.error("Sticker error:", e);
      sock.sendMessage(m.chat, { text: "⚠️ Sticker creation failed." }, { quoted: m });
    }
  },
};
