const fs = require("fs");
const path = require("path");

module.exports = {
    name: "menu",
    alias: ["help", "cmds"],
    category: "General",
    desc: "Show all commands dynamically",
    async execute(sock, m, args, { prefix }) {
        try {
            const pluginsDir = path.join(__dirname);
            const plugins = [];

            // Read all plugins in current directory
            fs.readdirSync(pluginsDir).forEach(file => {
                if (file.endsWith(".js") && file !== "menu.js") {
                    const plugin = require(path.join(pluginsDir, file));
                    if (plugin && plugin.name) {
                        plugins.push(plugin);
                    }
                }
            });

            // Auto-categorize
            const categories = {};
            plugins.forEach(p => {
                const cat = p.category || "Others";
                if (!categories[cat]) categories[cat] = [];
                categories[cat].push(p);
            });

            // Auto count commands
            const totalCommands = plugins.length;

            // Menu header
            let menuText = `╭━❮ *🤖 SOURAV_MD BOT MENU* ❯━╮\n`;
            menuText += `┣👑 Owner: SOURAV_MD\n`;
            menuText += `┣📦 Plugins: ${totalCommands}\n`;
            menuText += `┣⚡ Prefix: [ ${prefix} ]\n`;
            menuText += `┣📌 Mode: Public\n`;
            menuText += `┣🕒 Time: ${new Date().toLocaleTimeString()}\n`;
            menuText += `┣🌍 Date: ${new Date().toDateString()}\n`;
            menuText += `╰━━━━━━━━━━━━━━━╯\n\n`;

            // Dynamic categories
            for (const cat in categories) {
                menuText += `🔹 *${cat.toUpperCase()}*\n`;
                categories[cat].forEach((cmd, i) => {
                    menuText += `   ${i + 1}. ${prefix}${cmd.name}\n`;
                });
                menuText += `\n`;
            }

            await sock.sendMessage(m.chat, { text: menuText }, { quoted: m });
        } catch (err) {
            console.error("Menu Error:", err);
            sock.sendMessage(m.chat, { text: "❌ Failed to load menu!" }, { quoted: m });
        }
    }
};
