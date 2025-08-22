const fs = require("fs");
const path = require("path");

const OWNER = "SOURAV_MD";
const PREFIX = ".";
const VERSION = "1.0.3";
const MODE = "Public";
const LOGO = "https://i.ibb.co/x7M8Wmc/bot-logo.jpg";

module.exports = {
  name: "menu",
  command: ["menu", "help", "commands"],
  category: "general",
  description: "Show bot command list",
  use: ".menu",

  execute: async (sock, m, args) => {
    const jid = m?.key?.remoteJid;

    const reply = async (text) => {
      return sock.sendMessage(jid, { text }, { quoted: m });
    };

    try {
      let categories = {};

      const pluginsDir = path.join(__dirname);
      const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith(".js"));

      for (const file of files) {
        if (file === "menu.js") continue;
        try {
          delete require.cache[require.resolve(path.join(pluginsDir, file))];
          const plugin = require(path.join(pluginsDir, file));

          if (!plugin || !plugin.command) continue;

          const category = plugin.category || "Uncategorized";
          if (!categories[category]) categories[category] = [];

          let cmds = Array.isArray(plugin.command) ? plugin.command : [plugin.command];

          categories[category].push({
            name: plugin.name || file.replace(".js", ""),
            cmds,
            desc: plugin.description || ""
          });
        } catch (err) {
          console.error(`❌ Error in plugin ${file}:`, err.message);
          if (!categories["Broken Plugins"]) categories["Broken Plugins"] = [];
          categories["Broken Plugins"].push({
            name: file,
            cmds: ["❌"],
            desc: "Plugin error, check console"
          });
        }
      }

      // Build menu text
      let menuText = `╭───❰ *SOURAV_MD MENU* ❱───╮\n`;
      menuText += `│ 👑 Owner: ${OWNER}\n`;
      menuText += `│ 💎 Version: ${VERSION}\n`;
      menuText += `│ ✏️ Prefix: ${PREFIX}\n`;
      menuText += `│ 🔐 Mode: ${MODE}\n`;
      menuText += `╰─────────────────────╯\n`;

      for (const [cat, cmds] of Object.entries(categories)) {
        menuText += `\n┌─〔 ${cat.toUpperCase()} 〕\n`;
        for (const cmd of cmds) {
          menuText += `│ • ${PREFIX}${cmd.cmds[0]} — ${cmd.desc}\n`;
        }
        menuText += "└──────────────\n";
      }

      menuText += `\n⚡ POWERED BY SOURAV ⚡`;

      await sock.sendMessage(jid, { image: { url: LOGO }, caption: menuText }, { quoted: m });

    } catch (err) {
      console.error("❌ Menu error:", err);
      return reply("❌ Still failed. Check console log for details.");
    }
  }
};
