const axios = require("axios");

module.exports = {
    name: "pat",
    command: ["pat"],
    description: "Send a random pat GIF in group chat, tagging the user. Powered by SOURAV_,MD",

    async execute(sock, m, args) {
        try {
            const jid = m.key.remoteJid;

            // Ensure this command works only in groups
            if (!jid.endsWith("@g.us")) {
                return sock.sendMessage(jid, { text: "❌ This command works in *groups only*." }, { quoted: m });
            }

            const sender = m.key.participant || m.sender;
            const name = sender.includes("@") ? sender.split("@")[0] : sender;

            // Predefined pat GIFs
            const patGIFs = [
                "https://media.giphy.com/media/ARSp9T7wwxNcs/giphy.gif",
                "https://media.giphy.com/media/109ltuoSQT212w/giphy.gif",
                "https://media.giphy.com/media/109ltuoSQT212w/giphy.gif",
                "https://media.giphy.com/media/L2z7dnOduqEow/giphy.gif",
                "https://media.giphy.com/media/109ltuoSQT212w/giphy.gif",
                "https://media.giphy.com/media/ye7OTQgwmVuVy/giphy.gif",
                "https://media.giphy.com/media/4HP0ddZnNVvKU/giphy.gif"
            ];

            // Pick a random GIF
            const randomGIF = patGIFs[Math.floor(Math.random() * patGIFs.length)];

            // Send the GIF
            await sock.sendMessage(
                jid,
                {
                    video: { url: randomGIF },
                    gifPlayback: true,
                    caption: `🤗 Pat for @${name}!\nPowered by SOURAV_,MD`,
                    mentions: [sender]
                },
                { quoted: m }
            );

        } catch (err) {
            console.error("Pat Command Error:", err);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "❌ Failed to send pat GIF. Try again later." },
                { quoted: m }
            );
        }
    }
};
