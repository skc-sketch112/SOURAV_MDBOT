const { Sticker } = require("wa-sticker-formatter");

module.exports = {
  name: "sticker",
  command: ["sticker", "s"],
  async execute(sock, m) {
    try {
      console.log("🔎 FULL MESSAGE:", JSON.stringify(m, null, 2)); // Debug full msg

      if (!m.quoted || !(m.quoted.message?.imageMessage || m.quoted.message?.videoMessage)) {
        console.log("⚠️ No quoted media found!");
        return await sock.sendMessage(
          m.key.remoteJid,
          { text: "⚠️ Reply to an image/video with .sticker" },
          { quoted: m }
        );
      }

      console.log("✅ Quoted media found, downloading...");
      const buffer = await sock.downloadMediaMessage(m.quoted);

      if (!buffer) {
        console.log("❌ Media download failed!");
        return await sock.sendMessage(
          m.key.remoteJid,
          { text: "❌ Couldn't download media" },
          { quoted: m }
        );
      }

      console.log("🎨 Building sticker...");
      const sticker = new Sticker(buffer, {
        pack: "SOURAVMD",
        author: "WhatsApp Bot",
        type: "full",
        quality: 70,
      });

      const stickerBuffer = await sticker.toBuffer();
      console.log("✅ Sticker ready, sending...");
      await sock.sendMessage(m.key.remoteJid, { sticker: stickerBuffer }, { quoted: m });

    } catch (e) {
      console.error("🔥 Sticker Error:", e);
      await sock.sendMessage(m.key.remoteJid, { text: "❌ Error making sticker" }, { quoted: m });
    }
  }
};
