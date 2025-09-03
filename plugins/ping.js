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

      // Path to banner image
      const bannerPath = path.join(__dirname, "assets", "pong.png");
      const bannerBuffer = fs.readFileSync(bannerPath);

      // Send initial message with image + text
      const sentMsg = await sock.sendMessage(msg.key.remoteJid, {
        image: bannerBuffer,
        caption: "⚡ Initializing..."
      });

      // Add reaction once
      await sock.sendMessage(msg.key.remoteJid, {
        react: { text: "⚡", key: msg.key }
      });

      // Loader animation
      const frames = [
        "⚡ Checking Ping .",
        "⚡ Checking Ping ..",
        "⚡ Checking Ping ....",
        "⚡ Checking Ping ......"
      ];

      for (let i = 0; i < 16; i++) {
        await new Promise(res => setTimeout(res, 400));
        await sock.sendMessage(msg.key.remoteJid, {
          edit: sentMsg.key,
          image: bannerBuffer,
          caption: frames[i % frames.length]
        });
      }

      // Calculate stats
      const end = performance.now();
      const ping = Math.round(end - start);
      const uptime = process.uptime();
      const uptimeStr = new Date(uptime * 1000).toISOString().substr(11, 8);
      const version = "⚡ 4.0.0 ⚡";

      // Final styled message
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

      // Final edit with image + styled text
      await sock.sendMessage(msg.key.remoteJid, {
        edit: sentMsg.key,
        image: bannerBuffer,
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
