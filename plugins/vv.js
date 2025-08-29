const fs = require("fs");
const path = require("path");

const PHOTO_DIR = path.join(__dirname, "vv_photos");
if (!fs.existsSync(PHOTO_DIR)) fs.mkdirSync(PHOTO_DIR);

module.exports = {
  name: "vv",
  command: ["vv"],
  desc: "Retrieve any photo sent, including view-once. Powered by SOURAV_MD",

  // This function intercepts incoming messages
  async onMessage(sock, m) {
    try {
      const messageType = Object.keys(m.message || {})[0];
      if (messageType === "imageMessage") {
        const buffer = await sock.downloadMediaMessage({ message: m.message });
        const fileName = path.join(PHOTO_DIR, `photo-${Date.now()}.jpg`);
        fs.writeFileSync(fileName, buffer);
        console.log("Saved incoming photo:", fileName);
      }
    } catch (err) {
      console.error("Failed to save incoming photo:", err);
    }
  },

  async execute(sock, m, args) {
    const chat = m.key.remoteJid;
    try {
      // List all saved photos
      const files = fs.readdirSync(PHOTO_DIR);
      if (!files.length) {
        return sock.sendMessage(chat, { text: "❌ No saved photos yet!" }, { quoted: m });
      }

      // Send the last saved photo
      const lastPhoto = files[files.length - 1];
      const buffer = fs.readFileSync(path.join(PHOTO_DIR, lastPhoto));

      await sock.sendMessage(chat, {
        image: buffer,
        caption: "✅ Here’s your secret photo!\n\nPowered by SOURAV_MD",
        mimetype: "image/jpeg",
        fileName: lastPhoto
      }, { quoted: m });

    } catch (err) {
      console.error("VV Execute Error:", err);
      await sock.sendMessage(chat, {
        text: "❌ Failed to retrieve the photo."
      }, { quoted: m });
    }
  }
};
