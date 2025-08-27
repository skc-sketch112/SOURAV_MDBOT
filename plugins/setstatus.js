// setstatus.js - Ultra Pro Status Setter Plugin
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "setstatus",
  command: ["setstatus", "status"],
  description: "Set WhatsApp status with text or media.",

  async execute(sock, m, args, { axios, fetch }) {
    const jid = m.key.remoteJid;
    console.log(`[SetStatus] Command received at 02:08 PM IST, Aug 27, 2025: ${m.body} from ${jid}`);

    try {
      if (!args[0] && !m.quoted) {
        return sock.sendMessage(jid, { text: "❌ Please provide text or reply to media.\nExample: `.setstatus Hello` or reply to an image" }, { quoted: m });
      }

      const statusContent = args.join(" ") || (m.quoted ? await m.quoted.downloadMedia() : null);
      if (!statusContent && !args[0]) {
        throw new Error("No valid status content.");
      }

      // Set status
      if (typeof statusContent === "string") {
        await sock.updateProfileStatus(statusContent);
        console.log(`[SetStatus] Updated text status: ${statusContent}`);
        await sock.sendMessage(jid, { text: "✅ Status updated!" }, { quoted: m });
      } else if (statusContent) {
        const downloadsDir = path.join(__dirname, "../downloads");
        if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });
        const tempFile = path.join(downloadsDir, `status_${Date.now()}.${statusContent.mimetype.split("/")[1]}`);
        fs.writeFileSync(tempFile, Buffer.from(statusContent.data, "base64"));
        await sock.updateProfilePicture(jid, { url: tempFile }); // Note: Baileys may not support direct status media updates
        console.log(`[SetStatus] Updated media status from: ${tempFile}`);
        await sock.sendMessage(jid, { text: "✅ Status picture updated!" }, { quoted: m });
        fs.unlinkSync(tempFile);
      }

    } catch (err) {
      console.error("[SetStatus Error]:", err.message);
      await sock.sendMessage(jid, { text: `❌ Failed to set status.\nError: ${err.message}` }, { quoted: m });
    }
  }
};
