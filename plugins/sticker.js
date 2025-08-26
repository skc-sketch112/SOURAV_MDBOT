const { Sticker, StickerTypes } = require("wa-sticker-formatter");

module.exports = {
  name: "sticker",
  alias: ["s", "st"],
  desc: "Convert replied image/video to sticker",
  category: "converter",

  async exec({ m, sock }) {
    try {
      // Must reply to an image/video
      if (!m.quoted || !(m.quoted.mtype === "imageMessage" || m.quoted.mtype === "videoMessage")) {
        return m.reply("⚠️ শুধু image বা video কে reply দিয়ে `.sticker` লিখুন!");
      }

      // Download media
      let buffer = await m.quoted.download();
      if (!buffer) return m.reply("❌ Media download ফেইলড!");

      // Make sticker
      let sticker = new Sticker(buffer, {
        pack: "🔥 SOURAV_MD Pack",     // pack name
        author: "💎 SOURAV_MD Bot",    // author
        type: StickerTypes.FULL,       // FULL / CROP / CIRCLE
        quality: 85,                   // high quality
      });

      const stickerBuffer = await sticker.build();

      // Send back
      await sock.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m });

    } catch (err) {
      console.error("Sticker Error:", err);
      m.reply("❌ Sticker বানানো গেল না, আবার চেষ্টা করুন।");
    }
  }
};
