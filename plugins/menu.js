const fs = require("fs");
const path = require("path");

module.exports = {
  name: "menu",
  alias: ["help", "commands"],
  desc: "Interactive menu with buttons, plugin info & run system",
  category: "general",
  usage: ".menu",
  async execute(sock, msg, args) {
    try {
      const prefix = ".";
      const ownerName = "SOURAV";
      const version = "6";

      // 🔥 Auto-load plugins
      const pluginsPath = path.join(__dirname);
      const pluginFiles = fs.readdirSync(pluginsPath).filter(f => f.endsWith(".js"));
      let commands = [];
      for (const file of pluginFiles) {
        try {
          const plugin = require(path.join(pluginsPath, file));
          if (Array.isArray(plugin)) plugin.forEach(cmd => cmd.name && commands.push(cmd));
          else if (plugin.name) commands.push(plugin);
        } catch (e) {
          console.log("⚠️ Plugin load failed:", file, e.message);
        }
      }

      // Organize by category
      let categories = {};
      for (const cmd of commands) {
        const cat = (cmd.category || "Other").toUpperCase();
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(cmd);
      }

      // 🔹 Plugin info page
      if (args[0] && args[0].startsWith("info:")) {
        const cmdName = args[0].replace("info:", "").toLowerCase();
        const plugin = commands.find(c => c.name.toLowerCase() === cmdName);

        if (!plugin) {
          await sock.sendMessage(msg.key.remoteJid, { text: `⚠️ No info found for: ${cmdName}` }, { quoted: msg });
          return;
        }

        let infoText = `╭━━━ *PLUGIN INFO* ━━━╮\n`;
        infoText += `┃ 🔹 *Name:* ${plugin.name}\n`;
        if (plugin.alias) infoText += `┃ 🔹 *Alias:* ${plugin.alias.join(", ")}\n`;
        infoText += `┃ 🔹 *Category:* ${plugin.category || "Other"}\n`;
        infoText += `┃ 🔹 *Description:* ${plugin.desc || "No description"}\n`;
        infoText += `┃ 🔹 *Usage:* ${plugin.usage || prefix + plugin.name}\n`;
        infoText += `╰━━━━━━━━━━━━━━━━━━━━╯`;

        const buttons = [
          { buttonId: `${prefix}${plugin.name}`, buttonText: { displayText: "▶️ Run Now" }, type: 1 },
          { buttonId: `${prefix}menu ${plugin.category?.toUpperCase()}`, buttonText: { displayText: "⬅️ Back" }, type: 1 },
          { buttonId: `${prefix}menu`, buttonText: { displayText: "🏠 Main Menu" }, type: 1 }
        ];

        await sock.sendMessage(msg.key.remoteJid, {
          text: infoText,
          footer: "Powered by SOURAV",
          buttons,
          headerType: 1
        }, { quoted: msg });
        return;
      }

      // 🔹 Category view
      if (args[0]) {
        const catName = args[0].toUpperCase();
        if (!categories[catName]) {
          await sock.sendMessage(msg.key.remoteJid, { text: `⚠️ No such category: ${catName}` }, { quoted: msg });
          return;
        }

        const catCmds = categories[catName];
        if (!catCmds.length) {
          await sock.sendMessage(msg.key.remoteJid, { text: `⚠️ No commands in ${catName}` }, { quoted: msg });
          return;
        }

        const perPage = 10;
        let page = parseInt(args[1]) || 1;
        const totalPages = Math.ceil(catCmds.length / perPage);
        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;

        const start = (page - 1) * perPage;
        const end = start + perPage;
        const pageCmds = catCmds.slice(start, end);

        let text = `╭━━━ *${catName} COMMANDS* ━━━╮\n`;
        pageCmds.forEach((cmd, i) => {
          text += `┃ ${i + 1}. *${prefix}${cmd.name}*  (ℹ️)\n`;
        });
        text += `╰━━━━━━━━━━━━━━━╯\n\nPage ${page}/${totalPages}`;

        const buttons = [
          ...pageCmds.map(cmd => ({
            buttonId: `${prefix}menu info:${cmd.name}`,
            buttonText: { displayText: `ℹ️ ${cmd.name}` },
            type: 1
          })),
          ...(page > 1 ? [{ buttonId: `${prefix}menu ${catName} ${page-1}`, buttonText: { displayText: "⬅️ Previous" }, type: 1 }] : []),
          ...(page < totalPages ? [{ buttonId: `${prefix}menu ${catName} ${page+1}`, buttonText: { displayText: "➡️ Next" }, type: 1 }] : []),
          { buttonId: `${prefix}menu`, buttonText: { displayText: "🏠 Back to Menu" }, type: 1 }
        ];

        await sock.sendMessage(msg.key.remoteJid, {
          text,
          footer: "Powered by SOURAV",
          buttons,
          headerType: 1
        }, { quoted: msg });
        return;
      }

      // 🔹 Main menu
      let menuText = `╔═══════════════╗\n`;
      menuText += `║  *SOURAV_MD-V${version}*  ║\n`;
      menuText += `╚═══════════════╝\n\n`;
      menuText += `◆ OWNER: ${ownerName}\n`;
      menuText += `◆ VERSION: *${version}*\n`;
      menuText += `◆ PREFIX: *${prefix}*\n\n`;
      menuText += `📂 Select a category below 👇\n`;

      const buttons = Object.keys(categories).map(cat => ({
        buttonId: `${prefix}menu ${cat}`,
        buttonText: { displayText: `📂 ${cat}` },
        type: 1
      }));

      await sock.sendMessage(msg.key.remoteJid, {
        text: menuText,
        footer: "Powered by SOURAV",
        buttons,
        headerType: 1
      }, { quoted: msg });

    } catch (e) {
      console.error(e);
      await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Menu Error!" }, { quoted: msg });
    }
  }
};
