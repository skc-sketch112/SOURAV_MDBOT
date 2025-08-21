module.exports = {
    name: "ping",
    description: "Replies with pong",
    execute: async (sock, msg, sender) => {
        await sock.sendMessage(sender, { text: "pong ✅ SOURAV_MD V4.08.09✨" });
    }
};
