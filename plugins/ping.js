const { performance } = require("perf_hooks");
const os = require("os");

module.exports = {
  name: "ping",
  alias: ["p"],
  desc: "Check bot status & ping",
  category: "general",
  usage: ".ping",
  async execute(sock, msg, args) {
    try {
      const start = performance.now();

      // Initial msg
      const sentMsg = await sock.sendMessage(msg.key.remoteJid, {
        text: "⚡ Initializing ping..."
      });

      // Animate loading (edit same msg instead of sending new msgs)
      const frames = ["⚡ Pinging", "⚡ Pinging.", "⚡ Pinging..", "⚡ Pinging..."];
      for (let i = 0; i < frames.length; i++) {
        await new Promise(res => setTimeout(res, 450));
        await sock.sendMessage(msg.key.remoteJid, {
          edit: sentMsg.key,
          text: frames[i]
        });
      }

      // Stats
      const end = performance.now();
      const ping = Math.round(end - start);
      const uptime = process.uptime();
      const uptimeStr = new Date(uptime * 1000).toISOString().substr(11, 8);
      const version = "4.0.0";

      // Styled ping text
      const pingGlow = `🔥 ${ping} ms 🔥`;

      // Final result
      const styledMsg = `
╭━━━〔 ✨ *SOURAV_MD V4* ✨ 〕━━━╮

┣ 🚀 *Version* : ${version}
┣ ⏱ *Uptime*  : ${uptimeStr}
┣ 💻 *Host*    : ${os.hostname()}
┣ 🟢 *Status*  : ✅ Working Fine
┣ 📡 *Ping*    : ${pingGlow}

╰━━━━━━━━━━━━━━━━━━━━━━╯
⚡ Powered by *SOURAV_MD*
      `;

      // Edit last frame into styled result
      await sock.sendMessage(msg.key.remoteJid, {
        edit: sentMsg.key,
        text: styledMsg
      });

    } catch (err) {
      console.error("Ping command error:", err);
      await sock.sendMessage(msg.key.remoteJid, { text: "❌ Error in .ping command!" });
    }
  }
};
