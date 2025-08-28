const axios = require("axios");

module.exports = {
    name: "hug",
    command: ["hug"],
    description: "Send a random hug GIF in group chat, tagging the user. Powered by SOURAV_,MD",

    async execute(sock, m, args) {
        try {
            const jid = m.key.remoteJid;

            // Check if the message is in a group
            if (!jid.endsWith("@g.us")) {
                return sock.sendMessage(jid, { text: "❌ This command works in *groups only*." }, { quoted: m });
            }

            const sender = m.key.participant || m.sender;
            const name = sender.includes("@") ? sender.split("@")[0] : sender;

            // Predefined hug GIFs (you can add more links)
            const hugGIFs = [
                "https://media.giphy.com/media/l2QDM9Jnim1YVILXa/giphy.gif",
                "https://media.giphy.com/media/od5H3PmEG5EVq/giphy.gif",
                "https://media.giphy.com/media/wnsgren9NtITS/giphy.gif",
                "https://media.giphy.com/media/143v0Z4767T15e/giphy.gif",
                "https://media.giphy.com/media/10BcGXjbHOctZC/giphy.gif",
                "https://media.giphy.com/media/GMFUrC8E8aWoo/giphy.gif",
                "https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif"
            ];

            // Select a random GIF
            const randomGIF = hugGIFs[Math.floor(Math.random() * hugGIFs.length)];

            // Send the GIF
            await sock.sendMessage(
                jid,
                {
                    video: { url: randomGIF },
                    gifPlayback: true,
                    caption: `🤗 Hug for @${name}!\nPowered by SOURAV_,MD`,
                    mentions: [sender]
                },
                { quoted: m }
            );

        } catch (err) {
            console.error("Hug Command Error:", err);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "❌ Failed to send hug GIF. Try again later." },
                { quoted: m }
            );
        }
    }
};
