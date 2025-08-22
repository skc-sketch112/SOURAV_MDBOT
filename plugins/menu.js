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
      return sock.sendMessage(jid, { text }, { quoted: m });
    };

    try {
      const pluginsDir = __dirname; // current plugins folder
      const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith(".js"));

      let categories = {};

      for (const file of files) {
        if (file === "menu.js") continue;

        try {
          delete require.cache[require.resolve(path.join(pluginsDir, file))];
          const plugin = require(path.join(pluginsDir, file));

          if (!plugin || !plugin.command) {
            console.warn(`⚠️ Skipping ${file}: no command export`);
            continue;
          }

          const category = plugin.category || "Uncategorized";
          if (!categories[category]) categories[category] = [];

          const cmds = Array.isArray(plugin.command) ? plugin.command : [plugin.command];

          categories[category].push({
            name: plugin.name || file.replace(".js", ""),
            cmds,
            desc: plugin.description || "No description"
          });

        } catch (err) {
          console.error(`❌ Error loading ${file}:`, err.message);
          continue; // skip bad plugin
        }
      }

      // If no commands found
      if (Object.keys(categories).length === 0) {
        return reply("⚠️ No commands available. Please add plugins in the plugins folder.");
      }

      // Premium Menu Text
      let menuText = `╭─────〔 🤖 *BOT MENU* 〕─────◆\n`;
      menuText += `│   ⚡ POWERED BY *SOURAV_MD* ⚡\n`;
      menuText += `╰──────────────────────────◆\n\n`;

      for (const [cat, cmds] of Object.entries(categories)) {
        menuText += `🔰 *${cat.toUpperCase()}*\n`;
        for (const cmd of cmds) {
          menuText += `   ➤ .${cmd.cmds[0]} — ${cmd.desc}\n`;
        }
        menuText += `\n`;
      }

      menuText += `━━━━━━━━━━━━━━━━━━\n`;
      menuText += `💎 Premium Bot by SOURAV_MD\n`;
      menuText += `━━━━━━━━━━━━━━━━━━`;

      await sock.sendMessage(jid, {
        text: menuText
      }, { quoted: m });

    } catch (err) {
      console.error("menu.js error:", err);
      await sock.sendMessage(jid, { text: "❌ Still failed. Check logs." }, { quoted: m });
    }
  },
};
