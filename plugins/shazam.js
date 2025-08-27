// plugins/ghibliart.js
const fs = require("fs");
const path = require("path");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const fetch = require("node-fetch");

module.exports = {
  name: "ghibli",
  command: ["ghibli", "ghibliart"],
  description: "Transform any image into Ghibli-style art.",

  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;

    try {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const imageMsg = msg.message?.imageMessage || quoted?.imageMessage;

      if (!imageMsg) {
        return sock.sendMessage(jid, { text: "🖼️ Please reply to an *image*." }, { quoted: msg });
      }

      // Download image
      const buffer = await downloadMediaMessage(
        { message: quoted || msg.message },
        "buffer",
        {},
        { reuploadRequest: sock.updateMediaMessage }
      );

      const tempFile = path.join(__dirname, "../downloads/ghibli_input.jpg");
      fs.writeFileSync(tempFile, buffer);

      // Send to DeepAI Ghibli model
      const res = await fetch("https://api.deepai.org/api/toonify", {
        method: "POST",
        headers: { "Api-Key": process.env.DEEPAI_API_KEY },
        body: { image: fs.createReadStream(tempFile) }
      });

      const result = await res.json();
      if (!result.output_url) throw new Error("API failed");

      await sock.sendMessage(jid, {
        image: { url: result.output_url },
        caption: "✨ Your art in Studio Ghibli style!"
      }, { quoted: msg });

      fs.unlinkSync(tempFile);

    } catch (err) {
      console.error("Ghibli Error:", err);
      await sock.sendMessage(jid, { text: "❌ Failed to transform image." }, { quoted: msg });
    }
  }
};
