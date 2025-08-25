const os = require("os");
const moment = require("moment");

module.exports = {
  name: "alive",
  command: ["alive", "online", "bot"],
  execute: async (sock, m, args) => {
    try {
      // System info
      const uptime = moment.duration(process.uptime(), "seconds").humanize();
      const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
      const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
      const platform = os.platform();
      const cpu = os.cpus()[0].model;

      // Bot + owner info
      const botName = "⚡ Ultra-MD Bot";
      const ownerName = "👑 SOURAV_MD";
      const prefix = ".";

      const caption = `
╭───🔥 ${botName} 🔥───╮

🤖 *Bot Status:* Online ✅  
👑 *Owner:* ${ownerName}  
🕒 *Uptime:* ${uptime}  
⌨️ *Prefix:* ${prefix}  

💻 *System:* ${platform}  
⚡ *CPU:* ${cpu}  
📦 *RAM:* ${freeMem}GB free / ${totalMem}GB  

╰───────────────╯

✨ Type *${prefix}menu* to see all commands.
      `;

      // Send image with caption
      await sock.sendMessage(
        m.key.remoteJid,
        {
          image: { url: "https://i.imgur.com/G8r9n8T.jpeg" }, // 👈 Replace with your custom alive logo
          caption: caption,
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("Alive.js error:", err);
      await sock.sendMessage(
        m.key.remoteJid,
        { text: "❌ Error in alive command." },
        { quoted: m }
      );
    }
  }
};
