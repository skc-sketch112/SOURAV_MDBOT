const fs = require("fs");
const path = require("path");

module.exports = {
  name: "menu",
  command: ["menu", "help"],
  category: "general",
  description: "Show all available commands with categories",
  use: ".menu",

  execute: async (sock, m, args) => {
    const jid = m?.key?.remoteJid;

    const reply = async (text) => {
      if (typeof m?.reply === "function") return m.reply(text);
      return sock.sendMessage(jid, { text }, { quoted: m });
    };

    try {
      // Path to plugins folder
      const pluginsDir = path.join(__dirname);

      // Read all plugin files
      const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith(".js") && f !== "menu.js");

      let commands = [];

      for (const file of files) {
        const plugin = require(path.join(pluginsDir, file));
        if (plugin && plugin.command) {
          commands.push({
            name: plugin.name || file.replace(".js", ""),
            cmds: plugin.command,
            category: plugin.category || "uncategorized",
            description: plugin.description || "No description"
          });
        }
      }

      // Group by category
      let grouped = {};
      for (const cmd of commands) {
        if (!grouped[cmd.category]) grouped[cmd.category] = [];
        grouped[cmd.category].push(cmd);
      }

      // Build menu text
      let menuText = `🌐 *Bot Command Menu*\n\n`;

      for (const cat in grouped) {
        menuText += `📂 *${cat.toUpperCase()}*\n`;
        for (const cmd of grouped[cat]) {
          menuText += `▫️ ${cmd.cmds.map(c => `.${c}`).join(", ")} → ${cmd.description}\n`;
        }
        menuText += `\n`;
      }

      await reply(menuText);

    } catch (err) {
      console.error("Error in menu command:", err);
      await reply("❌ Error while generating menu.");
    }
  },
};
