const { performance } = require("perf_hooks");
const os = require("os");
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

      // Initial message
      const sentMsg = await sock.sendMessage(msg.key.remoteJid, {
        text: "⚡ Initializing..."
      });

      // Loader animation (edited in the same msg)
      const frames = [
        "⚡ Checking Ping",
        "⚡ Checking Ping.",
        "⚡ Checking Ping..",
        "⚡ Checking Ping..."
      ];
      for (let i = 0; i < 6; i++) {
        await new Promise(res => setTimeout(res, 500));
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

      // 🔥 Styled text
      const styledMsg = `
╭━━━〔 ⚡ *SOURAV_MD BOT ALIVE* ⚡ 〕━━━╮

┣ ⚡ *Version* : ${version}
┣ ⚡ *Uptime*  : ${uptimeStr}
┣ ⚡ *Host*    : render
┣ ⚡ *Status*  : ✅ Working Fine
┣ ⚡ *Ping*    : 🔥 ${ping} ms 🔥

╰━━━━━━━━━━━━━━━━━━━━━━╯
⚡ Join Channel : https://whatsapp.com/channel/0029VbB1XJ5FHWpuK4r8LV3A ⚡
      `;

      // Path to PONG banner image (saved in /assets)
      const bannerPath = path.join(__dirname, "assets", "pong.png");

      // Final edit with banner + text
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
