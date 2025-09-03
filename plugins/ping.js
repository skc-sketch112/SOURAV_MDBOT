const { performance } = require("perf_hooks");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "ping",
  alias: ["p"],
  desc: "⚡ Check bot status & ping ⚡",
  category: "general",
  usage: ".ping",
  async execute(sock, msg, args) {
    try {
      const start = performance.now();

      // Send initial message with reaction
      const sentMsg = await sock.sendMessage(msg.key.remoteJid, {
        text: "⚡ Initializing..."
      });
      await sock.sendMessage(msg.key.remoteJid, {
        react: { text: "⚡", key: msg.key }
      });

      // Loader animation (single message edits)
      const frames = [
        "⚡ Checking Ping .",
        "⚡ Checking Ping ..",
        "⚡ Checking Ping ....",
        "⚡ Checking Ping ......"
      ];

      // Animate 4 full cycles (16 edits) in the same message
      for (let i = 0; i < 16; i++) {
        await new Promise(res => setTimeout(res, 400));
        await sock.sendMessage(msg.key.remoteJid, {
          edit: sentMsg.key,
          text: frames[i % frames.length]
        });
      }

      // Calculate stats
      const end = performance.now();
      const ping = Math.round(end - start);
      const uptime = process.uptime();
      const uptimeStr = new Date(uptime * 1000).toISOString().substr(11, 8);
      const version = "⚡ 4.0.0 ⚡";

      // Final styled message with bold labels
      const styledMsg = `
╭━━━〔 ⚡ *SOURAV_MD BOT ALIVE* ⚡ 〕━━━╮

┣ ⚡ *Version* : ${version}
┣ ⚡ *Uptime*  : ${uptimeStr}
┣ ⚡ *Host*    : *render*
┣ ⚡ *Status*  : ✅ *Working Fine*
┣ ⚡ *Ping*    : 🔥 ${ping} ms 🔥

╰━━━━━━━━━━━━━━━━━━━━━━╯
⚡ Join Channel : https://whatsapp.com/channel/0029VbB1XJ5FHWpuK4r8LV3A ⚡
      `;

      // Path to banner image
      const bannerPath = path.join(__dirname, "assets", "pong.png");

      // Final edit with image + styled text (still SAME message)
      await sock.sendMessage(msg.key.remoteJid, {
        edit: sentMsg.key,
        image: fs.readFileSync(bannerPath),
        caption: styledMsg
      });

    } catch (err) {
      console.error("⚡ Ping command error:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "⚡ ❌ Error in .ping command!"
      });
    }
  }
};
