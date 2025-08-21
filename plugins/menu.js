module.exports = {
    name: "menu",
    command: ["menu", "help"],
    description: "Show all available commands",
    
    async execute(sock, m, args, commands) {
        let menuText = "📖 *Available Commands:*\n\n";

        for (let plugin of commands.values()) {
            menuText += `✨ *${plugin.name}* → .${plugin.command[0]}\n`;
        }

        await sock.sendMessage(
            m.key.remoteJid,
            { text: menuText },
            { quoted: m }
        );
    }
};
