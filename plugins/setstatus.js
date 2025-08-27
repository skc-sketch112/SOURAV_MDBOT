// setstatus.js - Advanced WhatsApp Status Setter Plugin
// Supports URLs, replied media, and auto-detection of image/video

const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { MessageMedia } = require("@whiskeysockets/baileys");

module.exports = {
  name: "setstatus",
  command: ["setstatus", "set status", "status"],
  description: "Set image or video as WhatsApp status instantly. Supports URLs or replied media.",

  async execute(sock, m, args, { axios, fetch }) {
    const jid = m.key.remoteJid;
    let mediaPath;
    let mediaType = "image/jpeg"; // Default to image

    try {
      // Handle URL
      if (args[0] && args[0].match(/^https?:\/\/.*\.(jpg|jpeg|png|mp4)$/i)) {
        const url = args[0];
        const extension = path.extname(url).slice(1).toLowerCase();
        mediaType = extension === "mp4" ? "video/mp4" : "image/jpeg";

        // Download
        const downloadsDir = path.join(__dirname, "../downloads");
        if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });
        mediaPath = path.join(downloadsDir, `${Date.now()}.${extension}`);

        const response = await axios.get(url, { responseType: "arraybuffer" });
        fs.writeFileSync(mediaPath, Buffer.from(response.data));
      } else if (m.message.extendedTextMessage?.contextInfo?.quotedMessage) {
        const quotedMsg = m.message.extendedTextMessage.contextInfo.quotedMessage;
        if (!quotedMsg.imageMessage && !quotedMsg.videoMessage) {
          return sock.sendMessage(jid, { text: "❌ Reply to an image or video message." }, { quoted: m });
        }

        // Extract media
        const buffer = await sock.downloadMediaMessage(quotedMsg);
        const downloadsDir = path.join(__dirname, "../downloads");
        if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });
        mediaPath = path.join(downloadsDir, `${Date.now()}.${quotedMsg.imageMessage ? "jpg" : "mp4"}`);
        fs.writeFileSync(mediaPath, buffer);

        mediaType = quotedMsg.imageMessage ? "image/jpeg" : "video/mp4";
      } else {
        return sock.sendMessage(jid, { text: "❌ Provide a URL (jpg/png/mp4) or reply to media." }, { quoted: m });
      }

      // Validate size (max ~100MB)
      const fileSize = fs.statSync(mediaPath).size / (1024 * 1024);
      if (fileSize > 100) {
        fs.unlinkSync(mediaPath);
        return sock.sendMessage(jid, { text: "❌ File too large (max 100MB)." }, { quoted: m });
      }

      // Set status
      const media = new MessageMedia(mediaType, fs.readFileSync(mediaPath));
      await sock.sendMessage("status@broadcast", { [mediaType.includes("video") ? "video" : "image"]: media });

      await sock.sendMessage(jid, { text: "✅ Status set successfully!" }, { quoted: m });

      // Clean up
      fs.unlinkSync(mediaPath);
    } catch (err) {
      console.error("[SetStatus Error]:", err.message);
      await sock.sendMessage(jid, { text: `❌ Error: ${err.message}` }, { quoted: m });
    }
  }
};
