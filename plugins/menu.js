const fs = require("fs");
const path = require("path");

module.exports = {
    name: "menu",
    command: ["menu", "help"],
    description: "Display main bot menu",

    execute: async (sock, m, args) => {
        try {
            // 📸 Menu image (media/menu.jpg)
            const imagePath = path.join(__dirname, "../media/menu.jpg");
            let imageBuffer = null;
            if (fs.existsSync(imagePath)) {
                imageBuffer = fs.readFileSync(imagePath);
            }

            // 🕒 Time & Date (pure JS)
            const now = new Date();
            const optionsDate = { year: "numeric", month: "long", day: "numeric" };
            const optionsTime = { hour: "2-digit", minute: "2-digit", hour12: true };
            const date = now.toLocaleDateString("en-IN", optionsDate);
            const time = now.toLocaleTimeString("en-IN", optionsTime);

            // ⚡ Speed (random for display)
            const speed = Math.floor(Math.random() * (30 - 10 + 1)) + 10;

            // ⏳ Uptime
            const uptime = process.uptime(); // seconds
            const uptimeStr = `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`;

            // 📝 Menu Text
            const menuText = `
╭━━━〔 🤖 *SOURAV_MD V4.08.09* 🤖 〕━━━╮

👑 *Owner* : SOURAV_MD
💎 *Version* : 4.08.09
📋 *Commands* : 253
✏️ *Prefix* : [.]
🔐 *Mode* : Public
⏰ *Time* : ${time}
🌍 *Timezone* : Asia/Kolkata
🚀 *Speed* : ${speed} ms
🟢 *Uptime* : ${uptimeStr}
📅 *Date* : ${date}

╰━━━━━━━━━━━━━━━━━━━━━━╯

📌 *COMMAND CATEGORIES*
🔹 General
🔹 Fun & Games
🔹 Spiritual
🔹 Tools
🔹 Owner
`;

            // ✅ Send with image if exists
            if (imageBuffer) {
                await sock.sendMessage(
                    m.key.remoteJid,
                    { image: imageBuffer, caption: menuText },
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
