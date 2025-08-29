const fs = require("fs");
const path = require("path");

// Folder to store grabbed photos
const PHOTO_DIR = path.join(__dirname, "vv_photos");
if (!fs.existsSync(PHOTO_DIR)) fs.mkdirSync(PHOTO_DIR);

module.exports = {
  name: "vv",
  command: ["vv", "secretphoto", "grabphoto"],
  desc: "Retrieve any view-once or disappearing photo. Powered by SOURAV_MD",
  async execute(sock, m, args) {
    const chat = m.key.remoteJid;

    try {
      let imageBuffer;
      let fileName;

      // Check if message contains a quoted photo
      if (m.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
        const quoted = m.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
        imageBuffer = await sock.downloadMediaMessage({ message: { imageMessage: quoted } });
      } 
      // Check if message itself contains the photo
      else if (m.message.imageMessage) {
        imageBuffer = await sock.downloadMediaMessage({ message: m.message });
      }

      if (!imageBuffer) {
        return sock.sendMessage(chat, {
          text: "❌ Please send or quote a photo first!"
        }, { quoted: m });
      }

      // Save the photo in vv_photos folder
      fileName = path.join(PHOTO_DIR, `secret-${Date.now()}.jpg`);
      fs.writeFileSync(fileName, imageBuffer);

      // Send back the photo
      await sock.sendMessage(chat, {
        image: fs.readFileSync(fileName),
        caption: "✅ Here’s your secret photo!\n\nPowered by SOURAV_MD",
        mimetype: "image/jpeg",
        fileName: `secret-${Date.now()}.jpg`
      }, { quoted: m });

      // Optional: Automatically delete file after sending to save space
      fs.unlinkSync(fileName);

    } catch (err) {
      console.error("VV Error:", err);
      await sock.sendMessage(chat, {
        text: "❌ Failed to retrieve the photo."
      }, { quoted: m });
    }
  }
};
