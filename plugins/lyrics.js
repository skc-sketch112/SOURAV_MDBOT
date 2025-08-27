// ghibliart.js
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

module.exports = {
  name: "ghibli",
  command: ["ghibli", "ghibliart"],
  description: "Transform any image into Ghibli-style art",

  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;
    try {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted || !quoted.imageMessage) {
        return sock.sendMessage(jid, { text: "🖼️ Reply to an *image* to transform it into Studio Ghibli art." }, { quoted: msg });
      }

      // Download image
      const buffer = await sock.downloadMediaMessage({ message: quoted });
      const filePath = path.join(__dirname, `../downloads/ghibli_${Date.now()}.jpg`);
      fs.writeFileSync(filePath, buffer);

      // Transform with OpenAI
      const result = await openai.images.edits({
        model: "gpt-image-1",
        image: fs.createReadStream(filePath),
        prompt: "Transform this into a magical Studio Ghibli-style art, dreamy colors, anime aesthetic.",
        size: "1024x1024",
      });

      fs.unlinkSync(filePath);

      await sock.sendMessage(jid, {
        image: { url: result.data[0].url },
        caption: "✨ Ghibli Art Transformation ✨",
      }, { quoted: msg });

    } catch (err) {
      console.error("Ghibli Art Error:", err);
      await sock.sendMessage(jid, { text: "❌ Failed to generate Ghibli art." }, { quoted: msg });
    }
  }
};
