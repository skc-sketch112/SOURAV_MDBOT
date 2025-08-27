// plugins/ghibliart.js
const fs = require("fs");
const path = require("path");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

module.exports = {
  name: "ghibli",
  command: ["ghibli", "ghibliart"],
  description: "Transform an image into Studio Ghibli art style.",

  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;

    try {
      if (!msg.message.imageMessage) {
        return sock.sendMessage(jid, { text: "🖼️ Please reply to an *image* to transform into Ghibli art." }, { quoted: msg });
      }

      // Download original image
      const buffer = await downloadMediaMessage(
        msg,
        "buffer",
        {},
        { reuploadRequest: sock.waUploadToServer }
      );

      // Save temp file
      const downloadsDir = path.join(__dirname, "../downloads");
      if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });
      const tempFile = path.join(downloadsDir, `ghibli_${Date.now()}.jpg`);
      fs.writeFileSync(tempFile, buffer);

      // Send to OpenAI Image Edit API
      const response = await openai.images.edit({
        model: "gpt-image-1",
        image: fs.createReadStream(tempFile),
        prompt: "Transform this picture into a Studio Ghibli anime art style.",
        size: "1024x1024"
      });

      // Send result to WhatsApp
      const ghibliUrl = response.data[0].url;
      await sock.sendMessage(jid, {
        image: { url: ghibliUrl },
        caption: "✨ Here’s your Studio Ghibli art!"
      }, { quoted: msg });

      fs.unlinkSync(tempFile); // Cleanup

    } catch (err) {
      console.error("[Ghibli Error]:", err);
      await sock.sendMessage(jid, { text: "⚠️ Failed to create Ghibli art. Please try again." }, { quoted: msg });
    }
  }
};
