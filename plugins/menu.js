const os = require("os");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "menu",
    command: ["menu", "help"],
    description: "Show the bot menu",

    execute: async (sock, m) => {
        try {
            // Bot Info
            const owner = "SOURAV_MD";
            const botName = "SOURAV_MD V4.08.09";
            const version = "4.08.09";
            const prefix = ".";
            const mode = "Public";

            // Time & Date
            const date = new Date();
            const time = date.toLocaleTimeString("en-GB", { hour12: false });
            const day = date.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
            });

            // Timezone
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";

            // Speed test
            const start = Date.now();
            const end = Date.now();
            const speed = end - start;

            // Uptime
            const uptime = process.uptime();
            const uptimeStr = `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`;

            // Total Commands (auto count plugins)
            let commandsCount = 0;
            try {
                const pluginsPath = path.join(__dirname);
                const files = fs.readdirSync(pluginsPath).filter(file => file.endsWith(".js"));
                commandsCount = files.length;
            } catch (e) {
                commandsCount = "N/A";
            }

            // Menu Message
            const menuText = `
┏━━━━━━━━━━━━━━━━━━━┓
       ✦ ${SOURAV_MD} ✦
┗━━━━━━━━━━━━━━━━━━━┛

👑 Owner      : ${owner}
💎 Version    : ${version}
📋 Commands   : ${commandsCount}
📝 Prefix     : [ ${prefix} ]
🔐 Mode       : ${mode}
⏰ Time       : ${time}
🌍 Timezone   : ${timezone}
🚀 Speed      : ${speed} ms
🟢 Uptime     : ${uptimeStr}
📅 Date       : ${day}

┏━━━━━━━━━━━━━━━━━━━┓
      🔥 Command Categories 🔥
┗━━━━━━━━━━━━━━━━━━━┛
📖 Quran, Gita, Hanuman Chalisa
🎮 Games, Fun, Dice, RPS
🛠️ Tools, TTS, Image Search
❤️ Emoji Packs & More!
`;

            // Logo (replace with your own image URL or path)
            const logoUrl = "https://files.catbox.moe/1ehy5a.jpg"; // Example hosted logo

            await sock.sendMessage(m.key.remoteJid, { text: "⏳ Loading menu..." }, { quoted: m });

            await sock.sendMessage(
                m.key.remoteJid,
                {
                    image: { url: logoUrl },
                    caption: menuText,
                },
                { quoted: m }
            );

        } catch (err) {
            console.error("Menu Error:", err);
            await sock.sendMessage(m.key.remoteJid, { text: "❌ Failed to load menu, please try again later." }, { quoted: m });
        }
    }
};
