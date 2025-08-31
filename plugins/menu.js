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
      const ownerName = "SOURAV";
      const version = "5";
      const plan = "FREE";
      const user = "SOURAV";
      const uptimeStr = new Date(process.uptime() * 1000).toISOString().substr(11, 8);
      const ramUsed = (os.totalmem() - os.freemem()) / (1024 * 1024);
      const ramTotal = os.totalmem() / (1024 * 1024);
      const ramPercent = ((ramUsed / ramTotal) * 100).toFixed(1);

      // 🟢 Menu Header
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

      // 🟢 Categories
      const categories = {
        FUN: ["8ball","reel","rcolor","rpg","aura","coin flip","lucky","slot","truth","dare","rate"],
        ANIME: ["anime1","anime2","anime3","anime4","anime6","anime7","anime8","anime9","anime10","anime11","anime12","animeart","anime wall"],
        BOOK: ["hanuman chalisa","gita","quran","book"],
        TOOL: ["APK","PDF","TTS","DMPROTECT","Ghibli","wikipedia","define","dictionary","grammer","calculator","vv","url","SETNSNE","AUTOBIO","AUTORRACTION","AUTONAME"],
        AI: ["imagine","imagine2","imagine3","imagine4","perplexity","ai voice","ai video"],
        GROUP: [] // Add GROUP commands here later
      };

      // Organize commands by category
      for (const cat in categories) {
        const catCommands = commands.filter(cmd => categories[cat].includes(cmd.name));
        if (catCommands.length === 0) continue;

        menuText += `╭━━━ *${cat}* ━━━╮\n`;
        catCommands.forEach((cmd, i) => {
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

      // 🟢 Send Menu with Image
      const imagePath = path.join(__dirname, "media", "menu.jpg");
      let menuMessage;
      if (fs.existsSync(imagePath)) {
        const imageBuffer = fs.readFileSync(imagePath);
        menuMessage = {
          image: imageBuffer,
          caption: menuText,
          footer: 'Powered by SOURAV',
          buttons: buttons,
          headerType: 4
        };
      } else {
        menuMessage = {
          text: menuText,
          buttons: buttons,
          headerType: 1
        };
      }

      await sock.sendMessage(msg.key.remoteJid, menuMessage, { quoted: msg });

    } catch (err) {
      console.error("❌ Menu Error:", err);
      await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Error loading menu. Try again later." }, { quoted: msg });
    }
  }
};
