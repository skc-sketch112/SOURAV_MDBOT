// setstatus.js - Advanced WhatsApp Status Setter Plugin
const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "setstatus",
  command: ["setstatus", "set status", "status"],
  description: "Set image or video as WhatsApp status.",

  async execute(sock, m, args, { axios, fetch }) {
    const jid = m.key.remoteJid;
    console.log(`[SetStatus] Command received: ${m.body} from ${jid}`);

    let mediaPath;
    let mediaType = "image/jpeg";

    try {
      // Handle URL
      if (args[0] && args[0].match(/^https?:\/\/.*\.(jpg|jpeg|png|mp4)$/i)) {
        const url = args[0];
        const extension = path.extname(url).slice(1).toLowerCase();
        mediaType = extension === "mp4" ? "video/mp4" : "image/jpeg";

        const downloadsDir = path.join(__dirname, "../downloads");
        if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });
        mediaPath = path.join(downloadsDir, `${Date.now()}.${extension}`);

        const response = await axios.get(url, { responseType: "arraybuffer", timeout: 30000 });
        fs.writeFileSync(mediaPath, Buffer.from(response.data));
      } else if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const quotedMsg = m.message.extendedTextMessage.contextInfo.quotedMessage;
        if (!quotedMsg.imageMessage && !quotedMsg.videoMessage) {
          return sock.sendMessage(jid, { text: "❌ ছবি বা ভিডিও বার্তায় উত্তর দিন।" }, { quoted: m });
        }

        console.log("[SetStatus] Downloading quoted media");
        const buffer = await sock.downloadMediaMessage({ message: quotedMsg }, "buffer");
        mediaType = quotedMsg.imageMessage ? "image/jpeg" : "video/mp4";

        const downloadsDir = path.join(__dirname, "../downloads");
        if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });
        mediaPath = path.join(downloadsDir, `${Date.now()}.${mediaType.includes("video") ? "mp4" : "jpg"}`);
        fs.writeFileSync(mediaPath, buffer);
      } else {
        return sock.sendMessage(jid, { text: "❌ URL (jpg/png/mp4) দিন বা ছবি/ভিডিওতে উত্তর দিন।\nউদাহরণ: `.setstatus https://picsum.photos/200/300`" }, { quoted: m });
      }

      // Validate file
      if (!fs.existsSync(mediaPath) || fs.statSync(mediaPath).size === 0) {
        throw new Error("Media file is missing or empty.");
      }

      // Check size (max ~100MB)
      const fileSize = fs.statSync(mediaPath).size / (1024 * 1024);
      if (fileSize > 100) {
        fs.unlinkSync(mediaPath);
        return sock.sendMessage(jid, { text: "❌ ফাইলটি খুব বড় (সর্বোচ্চ ১০০ এমবি)।" }, { quoted: m });
      }

      // Set status
      const media = { url: mediaPath, mimetype: mediaType };
      await sock.sendMessage("status@broadcast", { [mediaType.includes("video") ? "video" : "image"]: media }, { quoted: m });

      await sock.sendMessage(jid, { text: "✅ স্ট্যাটাস সফলভাবে সেট করা হয়েছে!" }, { quoted: m });

      // Clean up
      fs.unlinkSync(mediaPath);
      console.log(`[SetStatus] Cleaned up: ${mediaPath}`);
    } catch (err) {
      console.error("[SetStatus Error]:", err.message);
      await sock.sendMessage(jid, { text: `❌ স্ট্যাটাস সেট করতে ব্যর্থ।\nকারণ: ${err.message}` }, { quoted: m });
    }
  }
};
