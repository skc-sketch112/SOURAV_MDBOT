module.exports = {
    command: "menu",
    handler: async (sock, sender) => {
        await sock.sendMessage(sender, {
            text: "🤖 *Bot Menu*\n\n1. ping → pong\n2. menu → show this menu"
        })
    }
}
