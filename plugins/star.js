module.exports = {
    name: "star",
    command: ["star", "stars"],
    description: "Send star twinkle animation",
    execute: async (sock, m) => {
        const frames = [
            "⭐🌟✨💫🌠",
            "🌟✨💫🌠⭐",
            "✨💫🌠⭐🌟",
            "💫🌠⭐🌟✨",
            "🌠⭐🌟✨💫"
        ];
        for (let frame of frames) {
            await sock.sendMessage(m.key.remoteJid, { text: frame }, { quoted: m });
            await new Promise(r => setTimeout(r, 400));
        }
    }
};
