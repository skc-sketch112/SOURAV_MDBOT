const os = require("os");
const axios = require("axios");

module.exports = {
  name: "alive",
  command: ["alive", "online", "status"],
  execute: async (sock, m) => {
    try {
      // ⏳ Bot uptime
      let uptimeSec = process.uptime();
      let uptimeHrs = Math.floor(uptimeSec / 3600);
      let uptimeMin = Math.floor((uptimeSec % 3600) / 60);
      let uptime = `${uptimeHrs}h ${uptimeMin}m`;

      // 💻 System info
      let totalMem = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2);
      let freeMem = (os.freemem() / (1024 * 1024 * 1024)).toFixed(2);
      let platform = os.platform();
      let cpuModel = os.cpus()[0].model;

      // 📅 Date & Time
      let now = new Date();
      let date = now.toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      let time = now.toLocaleTimeString("en-IN");

      // ✨ Alive Message
      let aliveMsg = `✨ *SOURAV_MD STATUS* ✨

✅ I'm alive and running smoothly!

👑 *Owner:* SOURAV_MD  
🤖 *Bot Name:* SOURAV_MD  

📅 *Date:* ${date}  
⏰ *Time:* ${time}  
⏳ *Uptime:* ${uptime}  

💻 *Platform:* ${platform}  
🖥 *CPU:* ${cpuModel}  
📊 *RAM:* ${freeMem}GB / ${totalMem}GB  

🚀 _Your professional WhatsApp assistant is always online!_`;

      // 🎨 Random styles
      const styles = ["neon", "glitch", "matrix", "retro", "gradient"];
      const pick = styles[Math.floor(Math.random() * styles.length)];

      // 🔥 Multiple APIs for reliability
      const apiList = [
        `https://api.popcat.xyz/text?text=SOURAV_MD%20${pick}`,
        `https://dummyimage.com/600x400/000/fff.png&text=SOURAV_MD-${pick}`,
        `https://single-developers-api.vercel.app/textpro?theme=${pick}&text=SOURAV_MD`,
      ];

      let imgUrl = null;

      // ✅ Try each API until one works
      for (let api of apiList) {
        try {
          await axios.get(api, { timeout: 7000 });
          imgUrl = api;
          break;
        } catch (err) {
          console.warn(`⚠️ API failed: ${api}`);
        }
      }

      // Send Alive text first
      await sock.sendMessage(
        m.key.remoteJid,
        { text: aliveMsg },
        { quoted: m }
      );

      // Then Alive image (if available)
      if (imgUrl) {
        await sock.sendMessage(
          m.key.remoteJid,
          {
            image: { url: imgUrl },
            caption: `🌟 *SOURAV_MD ALIVE* 🌟\n🎨 Style: ${pick.toUpperCase()}`,
          },
          { quoted: m }
        );
      } else {
        await sock.sendMessage(
          m.key.remoteJid,
          { text: "⚠️ Logo API failed. Showing only text alive." },
          { quoted: m }
        );
      }
    } catch (err) {
      console.error("Alive.js error:", err);
      await sock.sendMessage(
        m.key.remoteJid,
        { text: "❌ Something went wrong with alive command." },
        { quoted: m }
      );
    }
  },
};
