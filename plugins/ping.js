module.exports = {
    command: "ping",
    handler: async (sock, sender) => {
        await sock.sendMessage(sender, { text: "pong ✅SOURAV_MD V4.05.06" })
    }
}
