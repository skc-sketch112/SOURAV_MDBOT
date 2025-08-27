const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const FormData = require("form-data");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

module.exports = {
  name: "ghibliart",
  command: ["ghibliart", "ghibli"],
  description: "Transform any image into Studio Ghibli style art (unlimited).",

  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;

    try {
      let imageUrl = null;

      // Ensure downloads folder exists
      const downloadsDir = path.join(__dirname, "../downloads");
      if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true });
      }

      // If user replied to an image
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (quoted?.imageMessage) {
        const buffer = await downloadMediaMessage(
          { message: quoted },
          "buffer",
          {},
          { logger: console }
        );

        const tempPath = path.join(downloadsDir, `ghibli_${Date.now()}.jpg`);
        fs.writeFileSync(tempPath, buffer);
        imageUrl = tempPath;
      } else if (args[0]?.startsWith("http")) {
        // If user gave a URL
        imageUrl = args[0];
      } else {
        return sock.sendMessage(jid, {
          text: "⚠️ Please reply to an image or provide an image URL.\nExample: `.ghibliart <url>`"
        }, { quoted: msg });
      }

      // --- AI Transformation ---
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error("Missing OpenAI API key (set OPENAI_API_KEY env).");

      const form = new FormData();
      if (fs.existsSync(imageUrl)) {
        form.append("image", fs.createReadStream(imageUrl));
      } else {
        const res = await fetch(imageUrl);
        const buffer = await res.buffer();
        const tempFile = path.join(downloadsDir, `ghibli_url_${Date.now()}.jpg`);
        fs.writeFileSync(tempFile, buffer);
        form.append("image", fs.createReadStream(tempFile));
      }

      form.append("prompt", "Transform this into Studio Ghibli style art, dreamy, detailed, cinematic.");
      form.append("size", "512x512");

      const res = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form
      });

      if (!res.ok) throw new Error(`API failed: ${res.statusText}`);
      const json = await res.json();

      const ghibliImage = json.data[0].url;
      if (!ghibliImage) throw new Error("No Ghibli image returned!");

      // Send back the transformed art
      await sock.sendMessage(jid, {
        image: { url: ghibliImage },
        caption: "✨ *Here’s your Studio Ghibli Art!*"
      }, { quoted: msg });

      if (fs.existsSync(imageUrl)) fs.unlinkSync(imageUrl);

    } catch (err) {
      console.error("Ghibli Art Error:", err);
      await sock.sendMessage(jid, {
        text: `❌ Failed to transform into Ghibli art.\nError: ${err.message}`
      }, { quoted: msg });
    }
  }
};
