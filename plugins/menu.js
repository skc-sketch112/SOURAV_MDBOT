module.exports = {
    name: "menu", // required
    command: ["menu", "help"], // aliases
    description: "Shows all available commands", // description for menu

    async execute(sock, m, args, commands) {
        try {
            let menuText = `🌟 *Sourav_Bot Command Menu* 🌟\n\n`;

            // Loop through all commands
            for (let [cmdName, cmdObj] of commands.entries()) {
                menuText += `👉 .${cmdName} — ${cmdObj.description || "No description"}\n`;
            }

            await sock.sendMessage(
                m.key.remoteJid,
                { text: menuText },
                { quoted: m }
            );
        } catch (err) {
            console.error("❌ Error in menu command:", err);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Failed to load menu. Please try again later." },
                { quoted: m }
            );
        }
    }
};
