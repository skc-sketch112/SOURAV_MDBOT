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

      const totalCommands = commands.length;
      const prefix = ".";
      const ownerName = "SOURAV_MD";
      const version = "5"; 
      const plan = "FREE";
      const user = "SOURAV";
      const uptimeStr = new Date(process.uptime() * 1000).toISOString().substr(11, 8);
      const ramUsed = (os.totalmem() - os.freemem()) / (1024 * 1024);
      const ramTotal = os.totalmem() / (1024 * 1024);
      const ramPercent = ((ramUsed / ramTotal) * 100).toFixed(1);

      // 🟣 Menu Header (Stylish)
      let menuText = `╔═══════════════╗\n`;
      menuText += `║   SOURAV_MD-V5   ║\n`;
      menuText += `╚═══════════════╝\n\n`;
      menuText += `◆ OWNER: ${ownerName}\n`;
      menuText += `◆ USER: ${user}\n`;
      menuText += `◆ PLAN: ${plan}\n`;
      menuText += `◆ VERSION: ${version}\n`;
      menuText += `◆ PREFIX: ${prefix}\n`;
      menuText += `◆ TIME: ${new Date().toLocaleTimeString("en-GB")}\n`;
      menuText += `◆ DATE: ${new Date().toDateString()}\n`;
      menuText += `◆ UPTIME: ${uptimeStr}\n`;
      menuText += `◆ COMMANDS: ${totalCommands}\n`;
      menuText += `◆ PLATFORM: ${os.platform().toUpperCase()}\n`;
      menuText += `◆ CPU: ${os.cpus()[0].model}\n`;
      menuText += `◆ RAM: ${Math.round(ramUsed)}MB / ${Math.round(ramTotal)}MB (${ramPercent}%)\n`;
      menuText += `◆ MODE: Public\n`;
      menuText += `◆ MOOD: ⚡\n\n`;

      // 🟢 Commands by Category
      const categories = {};
      commands.forEach(cmd => {
        const cat = cmd.category || "Others";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(cmd);
      });

      for (const cat in categories) {
        menuText += `╭━━━ ${cat.toUpperCase()} ━━━╮\n`;
        categories[cat].forEach((cmd,i) => {
          menuText += `┃ ${i+1}. ${prefix}${cmd.name}`;
          if (cmd.alias && cmd.alias.length) menuText += ` (alias: ${cmd.alias.join(", ")})`;
          menuText += `\n`;
        });
        menuText += `╰━━━━━━━━━━━━╯\n\n`;
      }

      menuText += `Powered by SOURAV\n\n`;

      // 🟢 Create buttons for all commands
      const buttons = commands.map(cmd => ({
        buttonId: `${prefix}${cmd.name}`,
        buttonText: { displayText: `${prefix}${cmd.name}` },
        type: 1
      }));

      // Split buttons into chunks if too many
      const chunkSize = 10; // max buttons per message
      for (let i = 0; i < buttons.length; i += chunkSize) {
        const chunkButtons = buttons.slice(i, i + chunkSize);
        await sock.sendMessage(msg.key.remoteJid, {
          text: menuText,
          buttons: chunkButtons,
          headerType: 1
        }, { quoted: msg });
      }

    } catch (err) {
      console.error("❌ Menu Error:", err);
      await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Error loading menu. Try again later." }, { quoted: msg });
    }
  }
};
