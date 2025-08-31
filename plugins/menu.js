const fs = require("fs");
const path = require("path");
const os = require("os");

module.exports = {
  name: "menu",
  alias: ["help", "commands"],
  desc: "Show all bot commands in categories",
  category: "general",
  usage: ".menu",
  async execute(sock, msg, args) {
    try {
      const pluginsPath = path.join(__dirname);

      // 🔥 Load All Plugins (.js files only)
      const pluginFiles = fs.readdirSync(pluginsPath).filter(file => file.endsWith(".js"));
      let commands = [];
      for (const file of pluginFiles) {
        try {
          const plugin = require(path.join(pluginsPath, file));
          if (Array.isArray(plugin)) plugin.forEach(cmd => cmd.name && commands.push(cmd));
          else if (plugin.name) commands.push(plugin);
        } catch (e) { console.error(`❌ Failed to load plugin ${file}:`, e.message); }
      }

      const prefix = ".";
      const ownerName = "SOURAV"; // Keep OWNER normal, your name bold
      const version = "5";
      const plan = "FREE";
      const user = "SOURAV"; // Bold in message
      const uptimeStr = new Date(process.uptime() * 1000).toISOString().substr(11, 8);
      const ramUsed = (os.totalmem() - os.freemem()) / (1024 * 1024);
      const ramTotal = os.totalmem() / (1024 * 1024);
      const ramPercent = ((ramUsed / ramTotal) * 100).toFixed(1);

      // 🟢 Menu Header (Premium Bold Style)
      let menuText = `╔═══════════════╗\n`;
      menuText += `║   *SOURAV_MD-V5*   ║\n`;
      menuText += `╚═══════════════╝\n\n`;
      menuText += `◆ OWNER: ${ownerName}\n`;
      menuText += `◆ USER: *${user}*\n`;
      menuText += `◆ PLAN: *${plan}*\n`;
      menuText += `◆ VERSION: *${version}*\n`;
      menuText += `◆ PREFIX: *${prefix}*\n`;
      menuText += `◆ TIME: *${new Date().toLocaleTimeString("en-GB")}*\n`;
      menuText += `◆ DATE: *${new Date().toDateString()}*\n`;
      menuText += `◆ UPTIME: *${uptimeStr}*\n`;
      menuText += `◆ COMMANDS: *${commands.length}*\n`;
      menuText += `◆ PLATFORM: *${os.platform().toUpperCase()}*\n`;
      menuText += `◆ CPU: *${os.cpus()[0].model}*\n`;
      menuText += `◆ RAM: *${Math.round(ramUsed)}MB / ${Math.round(ramTotal)}MB (${ramPercent}%) *\n`;
      menuText += `◆ MODE: *Public*\n`;
      menuText += `◆ MOOD: *⚡*\n\n`;

      // 🟢 Commands by Category
      const categories = {};
      commands.forEach(cmd => {
        const cat = cmd.category || "Others";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(cmd);
      });

      for (const cat in categories) {
        menuText += `╭━━━ *${cat.toUpperCase()}* ━━━╮\n`;
        categories[cat].forEach((cmd, i) => {
          menuText += `┃ ${i + 1}. *${prefix}${cmd.name}*`;
          if (cmd.alias && cmd.alias.length) menuText += ` (alias: *${cmd.alias.join(", ")}*)`;
          menuText += `\n`;
        });
        menuText += `╰━━━━━━━━━━━━╯\n\n`;
      }

      menuText += `Powered by *SOURAV*\n`;

      // 🟢 Buttons: All commands + menu button at end
      const buttons = [
        ...commands.map(cmd => ({
          buttonId: `${prefix}${cmd.name}`,
          buttonText: { displayText: `${prefix}${cmd.name}` },
          type: 1
        })),
        {
          buttonId: "menu_button",
          buttonText: { displayText: "📜 MENU" },
          type: 1
        }
      ];

      // 🟢 Send Menu with Optional Image
      const menuImage = fs.existsSync(path.join(__dirname, "menu.jpg")) ? {
        image: fs.readFileSync(path.join(__dirname, "menu.jpg")),
        caption: menuText,
        buttons: buttons,
        headerType: 4
      } : {
        text: menuText,
        buttons: buttons,
        headerType: 1
      };

      await sock.sendMessage(msg.key.remoteJid, menuImage, { quoted: msg });

    } catch (err) {
      console.error("❌ Menu Error:", err);
      await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Error loading menu. Try again later." }, { quoted: msg });
    }
  }
};
