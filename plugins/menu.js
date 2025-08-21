const fs = require("fs");
const path = require("path");

module.exports = {
    name: "menu",
    command: ["menu", "help"],
    description: "Show all available commands",

    async execute(sock, m) {
        try {
            // Read all plugin files
            const pluginFiles = fs.readdirSync(path.join(__dirname));

            let menuText = "📖 *Available Commands:*\n\n";

            for (let file of pluginFiles) {
                if (file.endsWith(".js") && file !== "menu.js") {
                    try {
                        const plugin = require(path.join(__dirname, file));
                        if (plugin && plugin.name && plugin.command) {
                            menuText += `✨ *${plugin.name}* → .${plugin.command[0]}\n`;
                        }
                    } catch (err) {
                        console.log(`⚠️ Skipped ${file}:`, err.message);
                    }
                }
            }

            await sock.sendMessage(m.key.remoteJid, { text: menuText }, { quoted: m });
        } catch (err) {
            console.error("❌ Error in menu.js:", err);
            await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Failed to load menu. Please try again later." }, { quoted: m });
        }
    }
};
