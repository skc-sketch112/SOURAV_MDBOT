const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  name: "remini",
  alias: ["enhance", "photoenhance", "imgfix"],
  desc: "Enhance or fix photos using OpenAI Remini AI",
  category: "image",
  usage: ".remini <reply to image>",

  async execute(sock, msg, args) {
    try {
      // Check if image is replied
      if (!msg.message.imageMessage && !msg.message.documentMessage) {
        return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Please reply to an image to enhance." }, { quoted: msg });
      }

      const quotedMsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage || msg.message;
      const media = quotedMsg.imageMessage || quotedMsg.documentMessage;

      // Download image buffer
      const buffer = await sock.downloadMediaMessage({ message: { imageMessage: media } }, "buffer");

      // Send initial loader with reaction
      const sentMsg = await sock.sendMessage(msg.key.remoteJid, {
        text: "⏳ Enhancing your photo... Please wait!"
      }, { quoted: msg });

      await sock.sendMessage(msg.key.remoteJid, {
        react: { text: "✨", key: msg.key }
      });

      // Simulate loader animation editing the same message
      const frames = [
        "⏳ Enhancing your photo .",
        "⏳ Enhancing your photo ..",
        "⏳ Enhancing your photo ...",
        "⏳ Enhancing your photo ...."
      ];

      for (let i = 0; i < 8; i++) {
        await new Promise(r => setTimeout(r, 400));
        await sock.sendMessage(msg.key.remoteJid, {
          edit: sentMsg.key,
          text: frames[i % frames.length]
        });
      }

      // Call OpenAI API for enhancement
      const openAiApiKey = "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";

      const formData = new FormData();
      formData.append("model", "gpt-image-enhance");
      formData.append("image", buffer, "input.png");

      const response = await axios.post("https://api.openai.com/v1/images/edits", formData, {
        headers: {
          "Authorization": `Bearer ${openAiApiKey}`,
          ...formData.getHeaders()
        },
        responseType: "arraybuffer"
      });

      const enhancedImage = Buffer.from(response.data, "binary");

      // Final edit with enhanced image
      await sock.sendMessage(msg.key.remoteJid, {
        edit: sentMsg.key,
        image: enhancedImage,
        caption: "✨ Photo enhanced successfully by Remini AI"
      });

    } catch (err) {
      console.error("Remini error:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Failed to enhance the image. Try again."
      }, { quoted: msg });
    }
  }
};
