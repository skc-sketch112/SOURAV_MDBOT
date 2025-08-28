const axios = require("axios");

const hugGIFs = [
    "https://media.giphy.com/media/od5H3PmEG5EVq/giphy.mp4",
    "https://media.giphy.com/media/l2QDM9Jnim1YVILXa/giphy.mp4",
    "https://media.giphy.com/media/wnsgren9NtITS/giphy.mp4",
    "https://media.giphy.com/media/HaC1WdpkL3W00/giphy.mp4"
];

module.exports = {
    name: "hug",
    command: ["hug"],
    description: "Send a random hug GIF in group chat. Powered by SOURAV_,MD",

    async execute(sock, m, args) {
        try {
            const jid = m.key.remoteJid;

            if (!jid.endsWith("@g.us")) return sock.sendMessage(jid, { text: "❌ This command works in *groups only*." }, { quoted: m });

            const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const targetUser = mentioned[0] || m.sender;
            const name = targetUser.split("@")[0];

            const randomGIF = hugGIFs[Math.floor(Math.random() * hugGIFs.length)];

            await sock.sendMessage(
                jid,
                {
                    video: { url: randomGIF },
                    mimetype: "video/mp4",
                    gifPlayback: true,
                    caption: `🤗 Hug for @${name}!\nPowered by SOURAV_,MD`,
                    mentions: [targetUser]
                },
                { quoted: m }
            );
        } catch (err) {
            console.error("Hug Error:", err);
            await sock.sendMessage(m.key.remoteJid, { text: "❌ Failed to send hug GIF." }, { quoted: m });
        }
    }
};
