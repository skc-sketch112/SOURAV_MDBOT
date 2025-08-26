// plugins/menu.js
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "menu",
  alias: ["help", "commands"],
  desc: "Show all bot commands in categories",
  category: "general",
  usage: ".menu",
  async execute(sock, msg, args) {
    try {
      const pluginsPath = path.join(__dirname);
      const pluginFiles = fs.readdirSync(pluginsPath).filter(file => file.endsWith(".js"));

      let commands = [];
      let totalCommands = 0;

      // Load Plugins
      for (const file of pluginFiles) {
        try {
          const plugin = require(path.join(pluginsPath, file));

          if (Array.isArray(plugin)) {
            plugin.forEach(cmd => {
              if (cmd.name) {
                commands.push(cmd);
                totalCommands++;
              }
            });
          } else {
            if (plugin.name) {
              commands.push(plugin);
              totalCommands++;
            }
          }
        } catch (e) {
          console.error(`❌ Failed to load plugin ${file}:`, e.message);
        }
      }

      const prefix = ".";
      const ownerName = "SOURAV_MD";

      // Auto Categorize
      const categories = {};
      for (const cmd of commands) {
        const cat = cmd.category || "Others";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(cmd);
      }

      // Header
      let menuText = `╭━❮ *🤖 SOURAV_MD BOT MENU* ❯━╮\n`;
      menuText += `┣👑 Owner: ${ownerName}\n`;
      menuText += `┣📦 Plugins: ${pluginFiles.length}\n`;
      menuText += `┣⚡ Total Commands: ${totalCommands}\n`;
      menuText += `┣⚡ Prefix: [ ${prefix} ]\n`;
      menuText += `┣📌 Mode: Public\n`;
      menuText += `┣🕒 Time: ${new Date().toLocaleTimeString()}\n`;
      menuText += `┣🌍 Date: ${new Date().toDateString()}\n`;
      menuText += `╰━━━━━━━━━━━━━━━╯\n\n`;

      // 🌟 Static Ecosystem Menu (তোমার লেখা অংশ)
      menuText += `
*🔥 SOURAV_MD - WhatsApp Bot Menu 🔥*

📌 *General Commands*
- .ping → Check bot alive
- .menu → Show this menu
- .help → Help section

🎵 *Music & Video*
- .play <song name> → Download from YouTube
- .ytmp3 <link> → YouTube MP3
- .ytmp4 <link> → YouTube MP4
- .scdl <link> → SoundCloud Download

😂 *Fun & Stickers*
- .sticker → Make sticker from image/video
- .attp <text> → Animated text sticker
- .toimg → Convert sticker to image

📚 *Utility*
- .pdf <reply img> → Convert image to PDF
- .tts <text> → Text to speech
- .calc <math> → Solve math

🌍 *Scrapers*
- .igdl <link> → Instagram video
- .fbdl <link> → Facebook video
- .tiktok <link> → TikTok downloader
- .googlesearch <query> → Google search

🧠 *AI*
- .ai <prompt> → Chat with AI
- .img <prompt> → AI Image Generator

⚙️ *System*
- .restart → Restart bot
- .uptime → Check uptime

─────────────────────\n\n`;

      // 🔥 Dynamic Auto Commands
      menuText += `*📂 AUTO COMMANDS LOADED FROM PLUGINS:*\n\n`;
      for (const cat in categories) {
        menuText += `╭━❮ *${cat.toUpperCase()}* ❯━╮\n`;
        categories[cat].forEach((cmd, i) => {
          menuText += `┃ ${i + 1}. ${prefix}${cmd.name}`;
          if (cmd.alias && cmd.alias.length > 0) {
            menuText += ` (alias: ${cmd.alias.join(", ")})`;
          }
          menuText += `\n`;
        });
        menuText += `╰━━━━━━━━━━━━━━━╯\n\n`;
      }

      // Logo + Send
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
