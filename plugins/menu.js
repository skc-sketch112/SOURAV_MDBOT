const fs = require("fs");
const path = require("path");

module.exports = {
  name: "menu",
  alias: ["help", "commands"],
  desc: "Show bot menu with pagination and plugin info",
  category: "general",
  usage: ".menu",
  async execute(sock, m, args) {
    try {
      const jid = m.key.remoteJid;

      // === Load Plugins ===
      const pluginFiles = fs.readdirSync(__dirname).filter(f => f.endsWith(".js"));
      const pageSize = 10;
      let page = parseInt(args[1]) || 1;
      let totalPages = Math.ceil(pluginFiles.length / pageSize);

      // === Handle Single Plugin Details ===
      if (args[0] && args[0] !== "plugins") {
        const pluginName = args[0];
        const pluginPath = path.join(__dirname, pluginName + ".js");

        if (fs.existsSync(pluginPath)) {
          const plugin = require(pluginPath);
          let details = `📂 *Plugin:* ${plugin.name}\n`;
          details += `📝 *Description:* ${plugin.desc || "No description"}\n`;
          details += `⚡ *Usage:* ${plugin.usage || "No usage info"}\n\n`;
          details += `⚡ Powered by Sourav V4`;

          await sock.sendMessage(jid, { text: details }, { quoted: m });
        } else {
          await sock.sendMessage(jid, { text: "❌ Plugin not found." }, { quoted: m });
        }
        return;
      }

      // === Show Plugins List (with Pagination) ===
      if (args[0] === "plugins") {
        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;

        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const currentPlugins = pluginFiles.slice(start, end);

        // Create plugin buttons (Telegram-like transparent style)
        const pluginButtons = currentPlugins.map(f => {
          let name = f.replace(".js", "");
          return {
            index: 1,
            quickReplyButton: {
              displayText: `📂 ${name}`,
              id: `.menu ${name}`
            }
          };
        });

        // Add navigation buttons
        if (page > 1) {
          pluginButtons.push({
            index: 2,
            quickReplyButton: { displayText: "⬅️ Back", id: `.menu plugins ${page - 1}` }
          });
        }
        if (page < totalPages) {
          pluginButtons.push({
            index: 3,
            quickReplyButton: { displayText: "➡️ Next", id: `.menu plugins ${page + 1}` }
          });
        }

        const msg = {
          text: `📂 *Installed Plugins* (Page ${page}/${totalPages})\n\nClick a button below to view details.\n\n⚡ Powered by Sourav V4`,
          footer: "Plugin Menu",
          templateButtons: pluginButtons,
        };

        await sock.sendMessage(jid, msg, { quoted: m });
        return;
      }

      // === Default Main Menu ===
      const menuText = `
╭───────────────◆
│     *SOURAV_MD-V6*
│
│   ◆ OWNER: SOURAV
│   ◆ VERSION: 4
│   ◆ PREFIX: .
│
╰───────────────◆

📂 *Select a category below 👇*
`;

      const buttons = [
        { index: 1, quickReplyButton: { displayText: "📂 Plugins", id: ".menu plugins 1" } },
        { index: 2, quickReplyButton: { displayText: "🛠 Tools", id: ".menu tools" } },
        { index: 3, quickReplyButton: { displayText: "ℹ️ About", id: ".menu about" } },
      ];

      const buttonMessage = {
        text: menuText,
        footer: "⚡ Powered by Sourav V4",
        templateButtons: buttons,
      };

      await sock.sendMessage(jid, buttonMessage, { quoted: m });

    } catch (err) {
      console.error("Menu Error:", err);
      await sock.sendMessage(m.key.remoteJid, { text: "❌ Failed to load menu." }, { quoted: m });
    }
  },
};
