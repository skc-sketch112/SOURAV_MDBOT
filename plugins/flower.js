module.exports = {
    name: "flower",
    command: ["flower", "flowers"],
    description: "Send flower blooming animation",
    execute: async (sock, m) => {
        const frames = [
            "🌸🌼🌻🌹🌷",
            "🌼🌻🌹🌷🌸",
            "🌻🌹🌷🌸🌼",
            "🌹🌷🌸🌼🌻",
            "🌷🌸🌼🌻🌹"
        ];
        for (let frame of frames) {
            await sock.sendMessage(m.key.remoteJid, { text: frame }, { quoted: m });
            await new Promise(r => setTimeout(r, 400));
        }
    }
};
