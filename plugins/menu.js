// menu.js
const fs = require("fs");
const path = require("path");
const os = require("os");

module.exports = {
  name: "menu",
  command: ["menu", "help"],
  description: "Shows the main bot menu",
  category: "Main",

  async execute(sock, m) {
    try {
      const { performance } = require("perf_hooks");

      // Bot Info
      const ownerName = "sourav_md";
      const botName = "SOURAV_MD";
      const version = "1.0.0";

      // Calculate speed
      const start = performance.now();
      const end = performance.now();
      const speed = (end - start).toFixed(2);

      // Uptime
      let uptimeSec = process.uptime();
      let uptime = new Date(uptimeSec * 1000).toISOString().substr(11, 8);

      // Date + Time
      const date = new Date().toLocaleDateString();
      const time = new Date().toLocaleTimeString();
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Auto Load Plugins
      const pluginDir = path.join(__dirname, ".");
      let categories = {};
      let totalPlugins = 0;

      fs.readdirSync(pluginDir).forEach(file => {
        if (file.endsWith(".js") && file !== "menu.js") {
          totalPlugins++;
          let category = "Other";
          if (file.includes("download")) category = "Download";
          else if (file.includes("group")) category = "Group";
          else if (file.includes("fun")) category = "Fun";
          else if (file.includes("owner")) category = "Owner";
          else if (file.includes("ai")) category = "AI";
          else if (file.includes("anime")) category = "Anime";
          else if (file.includes("convert")) category = "Convert";
          else if (file.includes("reaction")) category = "Reactions";
          else if (file.includes("main")) category = "Main";

          if (!categories[category]) categories[category] = [];
          categories[category].push(file.replace(".js", ""));
        }
      });

      // Build Menu Message
      let menuMsg = `╭━━━〔 *${botName}* 〕━━━╮\n`;
      menuMsg += `👑 Owner : ${ownerName}\n`;
      menuMsg += `💎 Version : ${version}\n`;
      menuMsg += `📂 Plugins : ${totalPlugins}\n`;
      menuMsg += `🚀 Speed : ${speed} ms\n`;
      menuMsg += `⏳ Uptime : ${uptime}\n`;
      menuMsg += `🌍 Timezone : ${timezone}\n`;
      menuMsg += `🕒 Time : ${time}\n`;
      menuMsg += `📅 Date : ${date}\n`;
      menuMsg += `╰━━━━━━━━━━━━━━╯\n\n`;

      // Category Wise Listing
      Object.keys(categories).forEach((cat, i) => {
        menuMsg += `\n📁 *${cat} Menu* (${categories[cat].length})\n`;
        categories[cat].forEach((cmd, idx) => {
          menuMsg += ` ${idx + 1}. ${cmd}\n`;
        });
      });

      // Send with Image
      await sock.sendMessage(m.key.remoteJid, {
        image: { url: "./menu.jpg" }, // make sure menu.jpg is in same folder as menu.js
        caption: menuMsg
      }, { quoted: m });

    } catch (e) {
      console.error("❌ Error in menu.js:", e);
      await sock.sendMessage(m.key.remoteJid, { text: "❌ Failed to load menu!" }, { quoted: m });
    }
  }
};
