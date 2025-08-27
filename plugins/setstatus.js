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
    let tempFile;

    try {
      // Handle URL
      if (args[0] && args[0].match(/^https?:\/\/.*\.(jpg|jpeg|png|mp4)$/i)) {
        const url = args[0];
        const extension = path.extname(url).slice(1).toLowerCase();
        mediaType = extension === "mp4" ? "video/mp4" : "image/jpeg";

        console.log(`[SetStatus] Downloading from URL: ${url}`);
        const response = await axios.get(url, { 
          responseType: "arraybuffer", 
          timeout: 30000,
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
        });
        buffer = Buffer.from(response.data);
      } else if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const quotedMsg = m.message.extendedTextMessage.contextInfo.quotedMessage;
        if (!quotedMsg.imageMessage && !quotedMsg.videoMessage) {
          return sock.sendMessage(jid, { text: "❌ ছবি বা ভিডিও বার্তায় উত্তর দিন।" }, { quoted: m });
        }

        console.log("[SetStatus] Downloading quoted media");
        console.log("[SetStatus] Quoted message:", JSON.stringify(quotedMsg, null, 2));
        buffer = await downloadMediaMessage(
          { key: m.key, message: quotedMsg },
          "buffer",
          {},
          { logger: sock.logger, reuploadRequest: sock.updateMediaMessage }
        );
        mediaType = quotedMsg.imageMessage ? "image/jpeg" : "video/mp4";
      } else {
        return sock.sendMessage(jid, { text: "❌ URL (jpg/png/mp4) দিন বা ছবি/ভিডিওতে উত্তর দিন।\nউদাহরণ: `.setstatus https://picsum.photos/200/300`" }, { quoted: m });
      }

      // Validate buffer
      console.log(`[SetStatus] Buffer size: ${buffer ? buffer.length / (1024 * 1024) : 0}MB`);
      if (!buffer || buffer.length === 0) {
        throw new Error("Media buffer is empty or invalid.");
      }

      // Check size (max ~100MB for WhatsApp status)
      const fileSize = buffer.length / (1024 * 1024);
      if (fileSize > 100) {
        return sock.sendMessage(jid, { text: "❌ ফাইলটি খুব বড় (সর্বোচ্চ ১০০ এমবি)।" }, { quoted: m });
      }

      // Save buffer to temp file
      const downloadsDir = path.join(__dirname, "../downloads");
      if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true });
        console.log(`[SetStatus] Created downloads directory: ${downloadsDir}`);
      }
      tempFile = path.join(downloadsDir, `status_${Date.now()}.${mediaType.includes("video") ? "mp4" : "jpg"}`);
      fs.writeFileSync(tempFile, buffer);
      console.log(`[SetStatus] Saved temp file: ${tempFile}, size: ${fileSize}MB`);

      // Set status
      console.log(`[SetStatus] Sending status: ${mediaType}, size: ${fileSize}MB`);
      await sock.sendMessage("status@broadcast", {
        [mediaType.includes("video") ? "video" : "image"]: { url: tempFile },
        caption: args.join(" ") || "SouravMD Status",
        backgroundColor: "#000000",
        font: 1,
        statusJidList: [sock.user.id] // Ensure status is visible to self
      });

      // Clean up
      fs.unlinkSync(tempFile);
      console.log(`[SetStatus] Cleaned up: ${tempFile}`);

      await sock.sendMessage(jid, { text: "✅ স্ট্যাটাস সফলভাবে সেট করা হয়েছে! দয়া করে আপনার স্ট্যাটাস চেক করুন।" }, { quoted: m });
    } catch (err) {
      console.error("[SetStatus Error]:", err.stack || err.message);
      await sock.sendMessage(jid, { text: `❌ স্ট্যাটাস সেট করতে ব্যর্থ।\nকারণ: ${err.message}` }, { quoted: m });
    }
  }
};
