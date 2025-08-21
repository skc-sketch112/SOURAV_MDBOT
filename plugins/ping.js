module.exports = {
    command: "ping",
    handler: async (sock, sender) => {
        await sock.sendMessage(sender, { text: "pong ✅" })
    }
}
