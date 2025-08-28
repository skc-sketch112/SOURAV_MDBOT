const axios = require("axios");

module.exports = {
    name: "kiss",
    command: ["kiss"],
    description: "Send a random kiss GIF in group chat, tagging the user. Powered by SOURAV_,MD",

    async execute(sock, m, args) {
        try {
            const jid = m.key.remoteJid;

            // Ensure this command works only in groups
            if (!jid.endsWith("@g.us")) {
                return sock.sendMessage(jid, { text: "❌ This command works in *groups only*." }, { quoted: m });
            }

            const sender = m.key.participant || m.sender;
            const name = sender.includes("@") ? sender.split("@")[0] : sender;

            // Predefined kiss GIFs
            const kissGIFs = [
                "https://media.giphy.com/media/G3va31oEEnIkM/giphy.gif",
                "https://media.giphy.com/media/FqBTvSNjNzeZG/giphy.gif",
                "https://media.giphy.com/media/bGm9FuBCGg4SY/giphy.gif",
                "https://media.giphy.com/media/11k3oaUjSlFR4I/giphy.gif",
                "https://media.giphy.com/media/zkppEMFvRX5FC/giphy.gif",
                "https://media.giphy.com/media/3o6ZsX2ZyukpG/giphy.gif",
                "https://media.giphy.com/media/KH1CTZtw1iP3W/giphy.gif"
            ];

            // Pick a random kiss GIF
            const randomGIF = kissGIFs[Math.floor(Math.random() * kissGIFs.length)];

            // Send the GIF
            await sock.sendMessage(
                jid,
                {
                    video: { url: randomGIF },
                    gifPlayback: true,
                    caption: `💋 Kiss for @${name}!\nPowered by SOURAV_,MD`,
                    mentions: [sender]
                },
                { quoted: m }
            );

        } catch (err) {
            console.error("Kiss Command Error:", err);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "❌ Failed to send kiss GIF. Try again later." },
                { quoted: m }
            );
        }
    }
};
