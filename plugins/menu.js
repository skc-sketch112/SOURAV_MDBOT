module.exports = {
    name: "menu",
    description: "Shows the bot menu",
    execute: async (sock, msg, sender) => {
        await sock.sendMessage(sender, {
            text: "🤖 *Bot Menu*\n\n1. .ping → pong\n2. .menu → show this menu\n3. .king → custom king command"
        });
    }
};
