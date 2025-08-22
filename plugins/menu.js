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
      const pluginsDir = path.join(__dirname);
      const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith(".js"));

      let categories = {};

      for (const file of files) {
        if (file === "menu.js") continue; // skip itself
        try {
          // Reload plugin fresh
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
          console.error(`❌ Failed to load ${file}:`, err.message);
          continue;
        }
      }

      if (Object.keys(categories).length === 0) {
        return reply("⚠️ No commands found. Add plugins in the plugins folder.");
      }

      // Build Premium Styled Menu
      let menuText = `╭───〔 🤖 BOT MENU 〕───◆\n`;
      menuText += `│   ⚡ POWERED BY *SOURAV_MD* ⚡\n`;
      menuText += `╰───────────────────────◆\n\n`;

      for (const [cat, cmds] of Object.entries(categories)) {
        menuText += `🔰 *${cat.toUpperCase()}* 🔰\n`;
        for (const cmd of cmds) {
          menuText += `   ➤ .${cmd.cmds[0]} — ${cmd.desc}\n`;
        }
        menuText += `\n`;
      }

      menuText += `━━━━━━━━━━━━━━━━━━\n`;
      menuText += `💎 Premium Bot Menu\n`;
      menuText += `🔗 Follow: @SOURAV_MD\n`;
      menuText += `━━━━━━━━━━━━━━━━━━`;

      // ✅ Send with Banner Image
      await sock.sendMessage(jid, {
        image: { url: "https://i.ibb.co/VxqHJSm/sourav-md-banner.jpg" }, // custom banner (I’ll design one for you)
        caption: menuText
      }, { quoted: m });

    } catch (err) {
      console.error("menu.js error:", err);
      await reply("❌ Failed to generate menu. Please check console logs.");
    }
  },
};
