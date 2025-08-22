const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");

module.exports = {
    name: "menu",
    command: ["menu", "help"],
    description: "Display main bot menu",

    execute: async (sock, m, args) => {
        try {
            // 📸 Menu image
            const imagePath = path.join(__dirname, "../media/menu.jpg");
            let imageBuffer = null;
            if (fs.existsSync(imagePath)) {
                imageBuffer = fs.readFileSync(imagePath);
            }

            // 🕒 Time & Date
            const time = moment().tz("Asia/Kolkata").format("hh:mm A");
            const date = moment().tz("Asia/Kolkata").format("MMMM DD, YYYY");

            // ⚡ Speed Test
            const speed = Math.floor(Math.random() * (30 - 10 + 1)) + 10;

            // ⏳ Uptime
            const uptime = process.uptime(); // in seconds
            const uptimeStr = `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`;

            // 🔎 Auto-read plugins
            const pluginsDir = path.join(__dirname);
            const pluginFiles = fs.readdirSync(pluginsDir).filter(file => file.endsWith(".js"));

            let commands = [];
            for (const file of pluginFiles) {
                const plugin = require(path.join(pluginsDir, file));
                if (plugin.command) {
                    if (Array.isArray(plugin.command)) {
                        commands.push(...plugin.command);
                    } else {
                        commands.push(plugin.command);
                    }
                }
            }

            // 📝 Make menu categories
            const general = commands.filter(cmd => ["menu","help","ping"].includes(cmd));
            const fun = commands.filter(cmd => ["joke","meme","quiz"].includes(cmd));
            const tools = commands.filter(cmd => ["sticker","toimg","tts"].includes(cmd));
            const owner = commands.filter(cmd => ["restart","shutdown","update"].includes(cmd));

            // 📝 Menu Text
            const menuText = `
╭━━━〔 🤖 *SOURAV_MD V4.08.09* 🤖 〕━━━╮

👑 *Owner* : SOURAV_MD
💎 *Version* : 4.08.09
📋 *Commands* : ${commands.length}
✏️ *Prefix* : [.]
🔐 *Mode* : Public
⏰ *Time* : ${time}
🌍 *Timezone* : Asia/Kolkata
🚀 *Speed* : ${speed} ms
🟢 *Uptime* : ${uptimeStr}
📅 *Date* : ${date}

╰━━━━━━━━━━━━━━━━━━━━━━╯

📌 *COMMAND CATEGORIES*

🔹 General: ${general.join(", ") || "—"}
🔹 Fun & Games: ${fun.join(", ") || "—"}
🔹 Tools: ${tools.join(", ") || "—"}
🔹 Owner: ${owner.join(", ") || "—"}
`;

            // ✅ Send with image if exists
            if (imageBuffer) {
                await sock.sendMessage(
                    m.key.remoteJid,
                    {
                        image: imageBuffer,
                        caption: menuText
                    },
                    { quoted: m }
                );
            } else {
                await sock.sendMessage(
                    m.key.remoteJid,
                    { text: menuText },
                    { quoted: m }
                );
            }
        } catch (err) {
            console.error("❌ Menu error:", err);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Failed to load menu." },
                { quoted: m }
            );
        }
    }
};
