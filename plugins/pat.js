const axios = require("axios");

const patGIFs = [
    "https://media.giphy.com/media/ARSp9T7wwxNcs/giphy.mp4",
    "https://media.giphy.com/media/109ltuoSQT212w/giphy.mp4",
    "https://media.giphy.com/media/L2z7dnOduqEow/giphy.mp4",
    "https://media.giphy.com/media/4HP0ddZnNVvKU/giphy.mp4"
];

module.exports = {
    name: "pat",
    command: ["pat"],
    description: "Send a random pat GIF in group chat. Powered by SOURAV_,MD",

    async execute(sock, m, args) {
        try {
            const jid = m.key.remoteJid;

            if (!jid.endsWith("@g.us")) return sock.sendMessage(jid, { text: "❌ This command works in *groups only*." }, { quoted: m });

            const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const targetUser = mentioned[0] || m.sender;
            const name = targetUser.split("@")[0];

            const randomGIF = patGIFs[Math.floor(Math.random() * patGIFs.length)];

            await sock.sendMessage(
                jid,
                {
                    video: { url: randomGIF },
                    mimetype: "video/mp4",
                    gifPlayback: true,
                    caption: `🤗 Pat for @${name}!\nPowered by SOURAV_,MD`,
                    mentions: [targetUser]
                },
                { quoted: m }
            );
        } catch (err) {
            console.error("Pat Error:", err);
            await sock.sendMessage(m.key.remoteJid, { text: "❌ Failed to send pat GIF." }, { quoted: m });
        }
    }
};
