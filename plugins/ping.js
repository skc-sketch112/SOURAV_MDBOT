module.exports = {
    name: "ping",
    description: "Replies with pong",
    execute: async (sock, msg, sender) => {
        await sock.sendMessage(sender, { text: "pong ✅" });
    }
};
