const { Sticker } = require("wa-sticker-formatter");
const fetch = require("node-fetch");

module.exports = {
  name: "textsticker",
  command: ["textsticker", "ts"],
  async execute(sock, m, args) {
    try {
      console.log("🔎 ARGS:", args);

      if (args.length < 1) {
        return await sock.sendMessage(
          m.key.remoteJid,
          { text: "⚠️ Usage: .textsticker your_text" },
          { quoted: m }
        );
      }

      const text = args.join(" ");
      console.log("📝 Generating text sticker with:", text);

      const url = `https://dummyimage.com/512x512/000/fff.png&text=${encodeURIComponent(text)}`;
      console.log("🌍 Fetching image from:", url);

      const res = await fetch(url);
      const buffer = await res.buffer();

      const sticker = new Sticker(buffer, {
        pack: "SOURAVMD",
        author: "WhatsApp Bot",
        type: "full",
        quality: 100,
      });

      const stickerBuffer = await sticker.toBuffer();
      console.log("✅ Text sticker built, sending...");
      await sock.sendMessage(m.key.remoteJid, { sticker: stickerBuffer }, { quoted: m });

    } catch (e) {
      console.error("🔥 TextSticker Error:", e);
      await sock.sendMessage(m.key.remoteJid, { text: "❌ Error making text sticker" }, { quoted: m });
    }
  }
};
