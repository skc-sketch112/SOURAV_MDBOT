// setstatus.js - Advanced WhatsApp Status Setter Plugin
const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "setstatus",
  command: ["setstatus", "set status", "status"],
  description: "Set image or video as WhatsApp status.",

  async execute(sock, m, args, { axios, fetch, downloadMediaMessage }) {
    const jid = m.key.remoteJid;
    console.log(`[SetStatus] Command received: ${m.body} from ${jid}`);

    let buffer;
    let mediaType = "image/jpeg";

    try {
      // Handle URL
      if (args[0] && args[0].match(/^https?:\/\/.*\.(jpg|jpeg|png|mp4)$/i)) {
        const url = args[0];
        const extension = path.extname(url).slice(1).toLowerCase();
        mediaType = extension === "mp4" ? "video/mp4" : "image/jpeg";

        console.log(`[SetStatus] Downloading from URL: ${url}`);
        const response = await axios.get(url, { responseType: "arraybuffer", timeout: 30000 });
        buffer = Buffer.from(response.data);
      } else if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const quotedMsg = m.message.extendedTextMessage.contextInfo.quotedMessage;
        if (!quotedMsg.imageMessage && !quotedMsg.videoMessage) {
          return sock.sendMessage(jid, { text: "❌ Reply to an image or video message." }, { quoted: m });
        }

        console.log("[SetStatus] Downloading quoted media");
        buffer = await downloadMediaMessage(quotedMsg, "buffer", {}, { logger: sock.logger });
        mediaType = quotedMsg.imageMessage ? "image/jpeg" : "video/mp4";
      } else {
        return sock.sendMessage(jid, { text: "❌ Provide a URL (jpg/png/mp4) or reply to an image/video.\nExample: `.setstatus https://picsum.photos/200/300`" }, { quoted: m });
      }

      // Validate buffer
      if (!buffer || buffer.length === 0) {
        throw new Error("Media buffer is empty.");
      }

      // Check size (max ~100MB for WhatsApp status)
      const fileSize = buffer.length / (1024 * 1024);
      if (fileSize > 100) {
        return sock.sendMessage(jid, { text: "❌ File too large (max 100MB)." }, { quoted: m });
      }

      // Set status
      await sock.sendMessage("status@broadcast", {
        [mediaType.includes("video") ? "video" : "image"]: buffer,
        caption: args.join(" ") || "SouravMD Status"
      });

      await sock.sendMessage(jid, { text: "✅ Status set successfully!" }, { quoted: m });
    } catch (err) {
      console.error("[SetStatus Error]:", err.message);
      await sock.sendMessage(jid, { text: `❌ Failed to set status.\nError: ${err.message}` }, { quoted: m });
    }
  }
};
