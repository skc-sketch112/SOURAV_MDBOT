const fs = require("fs");
const path = require("path");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

const PHOTO_DIR = path.join(__dirname, "vv_photos");
if (!fs.existsSync(PHOTO_DIR)) fs.mkdirSync(PHOTO_DIR);

module.exports = {
  name: "vv",
  alias: ["viewonce", "secret"],
  desc: "Retrieve any photo sent, including view-once. Powered by SOURAV_MD",
  category: "tools",

  // Automatically listen to messages & save view-once images
  async onMessage(sock, m) {
    try {
      const msg = m.message;

      // Handle both normal and view-once images
      let imageMessage =
        msg?.imageMessage ||
        msg?.viewOnceMessageV2?.message?.imageMessage ||
        msg?.viewOnceMessage?.message?.imageMessage;

      if (!imageMessage) return; // Not an image, skip

      // Download stream
      const stream = await downloadContentFromMessage(imageMessage, "image");
      let buffer = Buffer.from([]);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

      // Save the photo
      const fileName = path.join(PHOTO_DIR, `photo-${Date.now()}.jpg`);
      fs.writeFileSync(fileName, buffer);
      console.log("✅ Saved incoming photo:", fileName);
    } catch (err) {
      console.error("❌ Failed to save incoming photo:", err);
    }
  },

  // Command to get back the last saved photo
  async execute(sock, m, args) {
    const chat = m.key.remoteJid;
    try {
      const files = fs.readdirSync(PHOTO_DIR).filter(f => f.endsWith(".jpg"));
      if (!files.length) {
        return sock.sendMessage(chat, { text: "❌ No saved photos yet!" }, { quoted: m });
      }

      const lastPhoto = files[files.length - 1];
      const buffer = fs.readFileSync(path.join(PHOTO_DIR, lastPhoto));

      await sock.sendMessage(
        chat,
        {
          image: buffer,
          caption: "✅ Here’s your secret photo!\n\n⚡ Powered by SOURAV_MD",
          fileName: lastPhoto,
        },
        { quoted: m }
      );
    } catch (err) {
      console.error("VV Execute Error:", err);
      await sock.sendMessage(chat, { text: "❌ Failed to retrieve the photo." }, { quoted: m });
    }
  },
};
