// plugins/menu.js
const fs = require("fs");
const path = require("path");
const { proto } = require("@whiskeysockets/baileys");

module.exports = {
  name: "menu",
  alias: ["help", "commands"],
  desc: "Show all bot commands in categories",
  category: "general",
  usage: ".menu",
  async execute(sock, msg, args) {
    try {
      const pluginsPath = path.join(__dirname);
      const plugins = fs.readdirSync(pluginsPath).filter(file => file.endsWith(".js") && file !== "menu.js");

      let commands = [];
      for (const file of plugins) {
        try {
          const plugin = require(path.join(pluginsPath, file));
          if (plugin.name) commands.push(plugin);
        } catch (e) {
          console.error(`❌ Failed to load plugin ${file}:`, e.message);
        }
      }

      const totalCommands = commands.length;
      const prefix = ".";
      const ownerName = "SOURAV_MD";

      // Auto-categorize
      const categories = {};
      for (const cmd of commands) {
        const cat = cmd.category || "Others";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(cmd.name);
      }

      // Header
      let menuText = `╭━❮ *🤖 SOURAV_MD BOT MENU* ❯━╮\n`;
      menuText += `┣👑 Owner: ${ownerName}\n`;
      menuText += `┣📦 Plugins: ${totalCommands}\n`;
      menuText += `┣⚡ Prefix: [ ${prefix} ]\n`;
      menuText += `┣📌 Mode: Public\n`;
      menuText += `┣🕒 Time: ${new Date().toLocaleTimeString()}\n`;
      menuText += `┣🌍 Date: ${new Date().toDateString()}\n`;
      menuText += `╰━━━━━━━━━━━━━━━╯\n\n`;

      // Categories
      for (const cat in categories) {
        menuText += `╭━❮ *${cat.toUpperCase()}* ❯━╮\n`;
        categories[cat].forEach((cmd, i) => {
          menuText += `┃ ${i + 1}. ${prefix}${cmd}\n`;
        });
        menuText += `╰━━━━━━━━━━━━━━━╯\n\n`;
      }

      // Logo + Menu
      const logoUrl = "https://files.catbox.moe/1ehy5a.jpg";
      await sock.sendMessage(msg.key.remoteJid, {
        image: { url: logoUrl },
        caption: menuText
      }, { quoted: msg });

    } catch (err) {
      console.error("❌ Menu Error:", err);
      await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Error loading menu. Please try again." }, { quoted: msg });
    }
  }
};
