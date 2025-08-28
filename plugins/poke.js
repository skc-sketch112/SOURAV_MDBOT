const pokeGIFs = [
    "https://media.giphy.com/media/3o6ZtpxSZbQRRnwCKQ/giphy.mp4",
    "https://media.giphy.com/media/l0MYB8Ory7Hqefo9a/giphy.mp4",
    "https://media.giphy.com/media/12NUbkX6p4xOO4/giphy.mp4",
    "https://media.giphy.com/media/Q6L2Ch2w34sHS/giphy.mp4"
];

module.exports = {
    name: "poke",
    command: ["poke"],
    description: "Send a random poke GIF in group chat. Powered by SOURAV_,MD",

    async execute(sock, m, args) {
        try {
            const jid = m.key.remoteJid;
            if (!jid.endsWith("@g.us")) return sock.sendMessage(jid, { text: "❌ This command works in *groups only*." }, { quoted: m });

            const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const targetUser = mentioned[0] || m.sender;
            const name = targetUser.split("@")[0];

            const randomGIF = pokeGIFs[Math.floor(Math.random() * pokeGIFs.length)];

            await sock.sendMessage(jid, {
                video: { url: randomGIF },
                mimetype: "video/mp4",
                gifPlayback: true,
                caption: `👉 Poke for @${name}!\nPowered by SOURAV_,MD`,
                mentions: [targetUser]
            }, { quoted: m });
        } catch (err) {
            console.error("Poke Error:", err);
            await sock.sendMessage(m.key.remoteJid, { text: "❌ Failed to send poke GIF." }, { quoted: m });
        }
    }
};
