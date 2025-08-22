const fs = require("fs");
const path = require("path");

// === BOT INFO CONFIG ===
const OWNER = "SOURAV_MD";
const PREFIX = ".";
const VERSION = "1.0.3";
const MODE = "Public"; 
const LOGO = "https://i.ibb.co/x7M8Wmc/bot-logo.jpg"; // Replace with your logo

module.exports = {
  name: "menu",
  command: ["menu", "help", "commands"],
  category: "general",
  description: "Show bot command list",
  use: ".menu",

  execute: async (sock, m, args) => {
    const jid = m?.key?.remoteJid;

    const reply = async (text) => {
      if (typeof m?.reply === "function") return m.reply(text);
      return sock.sendMessage(jid, { text }, { quoted: m });
    };

    try {
      // Speed test
      const start = Date.now();
      const end = Date.now();
      const speed = end - start;

      // Uptime
      let uptimeSec = process.uptime();
      let uptimeStr =
        Math.floor(uptimeSec / 3600) + "h " +
        Math.floor((uptimeSec % 3600) / 60) + "m " +
        Math.floor(uptimeSec % 60) + "s";

      // Date & Time
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-GB", { hour12: false });
      const dateStr = now.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Load plugins
      const pluginsDir = path.join(__dirname);
      const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith(".js"));

      let categories = {};

      for (const file of files) {
        if (file === "menu.js") continue;
        try {
          delete require.cache[require.resolve(path.join(pluginsDir, file))]; // clear cache
          const plugin = require(path.join(pluginsDir, file));
          if (!plugin || !plugin.command) continue;

          const category = plugin.category || "Uncategorized";
          if (!categories[category]) categories[category] = [];

          let cmds = Array.isArray(plugin.command)
            ? plugin.command
            : [plugin.command];

          categories[category].push({
            name: plugin.name || file.replace(".js", ""),
            cmds,
            desc: plugin.description || ""
          });
        } catch (err) {
          console.error(`❌ Failed to load ${file}:`, err.message);
        }
      }

      // Build menu
      let menuText = `╭───❰ *SOURAV_MD MENU* ❱───╮\n`;
      menuText += `│ 👑 Owner : ${OWNER}\n`;
      menuText += `│ 💎 Version : ${VERSION}\n`;
      menuText += `│ 📋 Commands : ${Object.values(categories).flat().length}\n`;
      menuText += `│ ✏️ Prefix : [ ${PREFIX} ]\n`;
      menuText += `│ 🔐 Mode : ${MODE}\n`;
      menuText += `│ ⏰ Time : ${timeStr}\n`;
      menuText += `│ 🌍 Timezone : ${timezone}\n`;
      menuText += `│ 🚀 Speed : ${speed} ms\n`;
      menuText += `│ 🟢 Uptime : ${uptimeStr}\n`;
      menuText += `│ 📅 Date : ${dateStr}\n`;
      menuText += `╰─────────────────────╯\n`;

      // Categories with commands
      for (const [cat, cmds] of Object.entries(categories)) {
        menuText += `\n┌─〔 ${cat.toUpperCase()} 〕\n`;
        for (const cmd of cmds) {
          menuText += `│ • ${PREFIX}${cmd.cmds[0]} — ${cmd.desc}\n`;
        }
        menuText += "└──────────────\n";
      }

      menuText += `\n⚡ POWERED BY SOURAV ⚡`;

      // Send menu with image
      await sock.sendMessage(
        jid,
        {
          image: { url: LOGO },
          caption: menuText
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("❌ Menu generation error:", err);
      await reply("❌ Failed to generate menu. Please check console logs.");
    }
  }
};
