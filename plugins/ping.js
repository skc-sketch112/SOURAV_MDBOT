module.exports = {
    name: "ping",
    command: ["ping"],
    execute: async (sock, m, args) => {
        await sock.sendMessage(m.key.remoteJid, { text: "🏓 Pong!SOURAV_MD V4.08.09⚡welcome to SOURAV_MD 🔥✨" }, { quoted: m });
    }
};
