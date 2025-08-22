const os = require("os");

module.exports = {
    name: "menu",
    command: ["menu", "help"],
    description: "Show the bot menu",

    execute: async (sock, m) => {
        try {
            const owner = "SOURAV_MD";
            const botName = "SOURAV_MD V4.08.09";
            const version = "4.08.09";
            const prefix = ".";
            const mode = "Public";

            const date = new Date();
            const time = date.toLocaleTimeString("en-GB", { hour12: false });
            const day = date.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
            });

            const uptime = process.uptime();
            const uptimeStr = `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`;

            const menuText = `
┏━━━━━━━━━━━━━━━━━━━┓
       ✦ ${botName} ✦
┗━━━━━━━━━━━━━━━━━━━┛

👑 Owner      : ${owner}
💎 Version    : ${version}
📋 Commands   : Auto Count Disabled
📝 Prefix     : [ ${prefix} ]
🔐 Mode       : ${mode}
⏰ Time       : ${time}
🌍 Timezone   : Asia/Kolkata
🟢 Uptime     : ${uptimeStr}
📅 Date       : ${day}

┏━━━━━━━━━━━━━━━━━━━┓
      🔥 Categories 🔥
┗━━━━━━━━━━━━━━━━━━━┛
📖 Quran, Gita, Hanuman Chalisa
🎮 Games, Fun, Dice, RPS
🛠️ Tools, TTS, Image Search
❤️ Emoji Packs & More!
`;

            await sock.sendMessage(m.key.remoteJid, { text: "⏳ Loading menu..." }, { quoted: m });

            await sock.sendMessage(
                m.key.remoteJid,
                { text: menuText },
                { quoted: m }
            );

        } catch (err) {
            console.error("Menu Error:", err);
            await sock.sendMessage(m.key.remoteJid, { text: "❌ Failed to load menu, please try again later." }, { quoted: m });
        }
    }
};
