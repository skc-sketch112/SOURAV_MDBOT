const fs = require("fs");
const path = require("path");

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
      const pluginsDir = path.join(__dirname);
      const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith(".js"));

      let categories = {};

      for (const file of files) {
        if (file === "menu.js") continue; // skip itself
        try {
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
          console.error(`Failed to load ${file} for menu:`, err.message);
        }
      }

      let menuText = `╭───「 *BOT MENU* 」\n`;
      for (const [cat, cmds] of Object.entries(categories)) {
        menuText += `\n┌─〔 ${cat.toUpperCase()} 〕\n`;
        for (const cmd of cmds) {
          menuText += `│ • .${cmd.cmds[0]} — ${cmd.desc}\n`;
        }
        menuText += "└──────────────\n";
      }
      menuText += "\n╰───「 END 」";

      await sock.sendMessage(jid, { text: menuText }, { quoted: m });
    } catch (err) {
      console.error("menu error:", err);
      await reply("❌ Failed to generate menu. Check console logs.");
    }
  }
};
