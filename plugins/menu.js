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

      // 🔥 Auto Load All Plugins (.js files only)
      const pluginFiles = fs.readdirSync(pluginsPath).filter(file => file.endsWith(".js"));
      let commands = [];

      for (const file of pluginFiles) {
        try {
          const plugin = require(path.join(pluginsPath, file));
          if (Array.isArray(plugin)) {
            plugin.forEach(cmd => { if (cmd.name) commands.push(cmd); });
          } else {
            if (plugin.name) commands.push(plugin);
          }
        } catch (e) {
          console.error(`❌ Failed to load plugin ${file}:`, e.message);
        }
      }

      // ✅ Total command count
      const totalCommands = commands.length;

      const prefix = ".";
      const ownerName = "SOURAV_MD";
      const version = "4";
      const plan = "FREE";
      const user = "SOURAV";
      const uptime = process.uptime();
      const uptimeStr = new Date(uptime * 1000).toISOString().substr(11, 8);

      const ramUsed = (os.totalmem() - os.freemem()) / (1024 * 1024);
      const ramTotal = os.totalmem() / (1024 * 1024);
      const ramPercent = ((ramUsed / ramTotal) * 100).toFixed(1);

      // 🌈 Gradient Style Text Function
      function gradientText(text) {
        const colors = ["🟥","🟧","🟨","🟩","🟦","🟪"]; 
        return text.split("").map((ch,i)=> colors[i % colors.length] + ch).join("") + "⬜";
      }

      // Header
      let menuText = `${gradientText(" SOURAV_MD-V4 ")}\n\n`;
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
      menuText += `◆ RUNTIME: Node.js ${process.version}\n`;
      menuText += `◆ CPU: ${os.cpus()[0].model}\n`;
      menuText += `◆ RAM: ${Math.round(ramUsed)}MB / ${Math.round(ramTotal)}MB (${ramPercent}%)\n`;
      menuText += `◆ MODE: Public\n`;
      menuText += `◆ MOOD: ⚡\n\n`;

      // Dynamic Commands
      menuText += `*📂 COMMANDS BY CATEGORY:*\n\n`;
      const categories = {};
      for (const cmd of commands) {
        const cat = cmd.category || "Others";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(cmd);
      }

      for (const cat in categories) {
        const catTitle = gradientText(` ${cat.toUpperCase()} `);
        menuText += `╭━━━❮${catTitle}❯━━━╮\n`;
        categories[cat].forEach((cmd, i) => {
          menuText += `┃ ${i + 1}. ${prefix}${cmd.name}`;
          if (cmd.alias && cmd.alias.length > 0) {
            menuText += ` (alias: ${cmd.alias.join(", ")})`;
          }
          menuText += `\n`;
        });
        menuText += `╰━━━━━━━━━━━━━━━╯\n\n`;
      }

      // 📜 Split long menu into chunks
      const chunks = menuText.match(/.{1,800}/gs); 
      for (const chunk of chunks) {
        await new Promise(resolve => setTimeout(resolve, 800)); 
        await sock.sendMessage(msg.key.remoteJid, { text: chunk }, { quoted: msg });
      }

    } catch (err) {
      console.error("❌ Menu Error:", err);
      await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Error loading menu. Please try again." }, { quoted: msg });
    }
  }
};
