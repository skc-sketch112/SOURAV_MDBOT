const fs = require("fs");
const path = require("path");

const OWNER = "SOURAV_MD";
const PREFIX = ".";
const VERSION = "1.0.4";
const MODE = "Public";
const LOGO = "https://i.ibb.co/x7M8Wmc/bot-logo.jpg";

module.exports = {
  name: "menu",
  command: ["menu", "help", "commands"],
  category: "general",
  description: "Show all bot commands",
  use: ".menu",

  execute: async (sock, m) => {
    const jid = m?.key?.remoteJid;

    const reply = async (text) => {
      return sock.sendMessage(jid, { text }, { quoted: m });
    };

    try {
      let categories = {};

      // 🔹 Find all plugin files in plugins folder
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
          console.error("❌ Plugin error:", file, err.message);
        }
      }

      // 🔹 Always reply, even if no plugins found
      let menuText = `╭───❰ *SOURAV_MD MENU* ❱───╮\n`;
      menuText += `│ 👑 Owner: ${OWNER}\n`;
      menuText += `│ 💎 Version: ${VERSION}\n`;
      menuText += `│ ✏️ Prefix: ${PREFIX}\n`;
      menuText += `│ 🔐 Mode: ${MODE}\n`;
      menuText += `╰─────────────────────╯\n`;

      if (Object.keys(categories).length === 0) {
        menuText += `\n⚠️ No plugins found!`;
      } else {
        for (const [cat, cmds] of Object.entries(categories)) {
          menuText += `\n┌─〔 ${cat.toUpperCase()} 〕\n`;
          for (const cmd of cmds) {
            menuText += `│ • ${PREFIX}${cmd.cmds[0]} — ${cmd.desc}\n`;
          }
          menuText += "└──────────────\n";
        }
      }

      menuText += `\n⚡ POWERED BY SOURAV ⚡`;

      await sock.sendMessage(jid, {
        image: { url: LOGO },
        caption: menuText
      }, { quoted: m });

    } catch (err) {
      console.error("❌ Menu error:", err);
      return reply("❌ Menu failed. Check console logs.");
    }
  }
};
