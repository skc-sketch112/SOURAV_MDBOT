// ghibliart.js - Ultra Advanced Ghibli Art Transformer
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const FormData = require("form-data");

module.exports = {
  name: "ghibliart",
  command: ["ghibliart", "ghibli"],
  description: "Transform any image into Studio Ghibli style art (unlimited).",

  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;

    try {
      // Get image input (from reply or URL argument)
      let imageUrl = null;
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (quoted?.imageMessage) {
        // If replying to an image
        const imgBuffer = await sock.downloadMediaMessage({ message: quoted });
        const tempPath = path.join(__dirname, "../downloads", `ghibli_${Date.now()}.jpg`);
        fs.writeFileSync(tempPath, imgBuffer);
        imageUrl = tempPath;
      } else if (args[0]?.startsWith("http")) {
        imageUrl = args[0];
      } else {
        return sock.sendMessage(jid, {
          text: "⚠️ Please reply to an image or provide an image URL.\nExample: `.ghibliart <url>`"
        }, { quoted: msg });
      }

      // AI API (OpenAI / Replicate / Custom Stable Diffusion endpoint)
      // Example below: OpenAI Image Edit endpoint
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error("Missing OpenAI API key (set OPENAI_API_KEY env).");

      const form = new FormData();
      if (fs.existsSync(imageUrl)) {
        form.append("image", fs.createReadStream(imageUrl));
      } else {
        // Download external URL first
        const res = await fetch(imageUrl);
        const buffer = await res.buffer();
        const tempFile = path.join(__dirname, "../downloads", `ghibli_url_${Date.now()}.jpg`);
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

      // Send back the transformed image
      await sock.sendMessage(jid, {
        image: { url: ghibliImage },
        caption: "✨ *Here’s your Studio Ghibli Art!*"
      }, { quoted: msg });

      // Cleanup temp
      if (fs.existsSync(imageUrl)) fs.unlinkSync(imageUrl);

    } catch (err) {
      console.error("Ghibli Art Error:", err);
      await sock.sendMessage(jid, {
        text: `❌ Failed to transform into Ghibli art.\nError: ${err.message}`
      }, { quoted: msg });
    }
  }
};
