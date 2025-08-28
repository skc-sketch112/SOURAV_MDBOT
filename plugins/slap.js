const slapGIFs = [
    "https://media.giphy.com/media/Gf3AUz3eBNbTW/giphy.mp4",
    "https://media.giphy.com/media/mEtSQlxqBtWWA/giphy.mp4",
    "https://media.giphy.com/media/jLeyZWgtwgr2U/giphy.mp4",
    "https://media.giphy.com/media/Zau0yrl17uzdK/giphy.mp4"
];

module.exports = {
    name: "slap",
    command: ["slap"],
    description: "Send a random slap GIF in group chat. Powered by SOURAV_,MD",

    async execute(sock, m, args) {
        try {
            const jid = m.key.remoteJid;
            if (!jid.endsWith("@g.us")) return sock.sendMessage(jid, { text: "❌ This command works in *groups only*." }, { quoted: m });

            const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const targetUser = mentioned[0] || m.sender;
            const name = targetUser.split("@")[0];

            const randomGIF = slapGIFs[Math.floor(Math.random() * slapGIFs.length)];

            await sock.sendMessage(jid, {
                video: { url: randomGIF },
                mimetype: "video/mp4",
                gifPlayback: true,
                caption: `✋ Slap for @${name}!\nPowered by SOURAV_,MD`,
                mentions: [targetUser]
            }, { quoted: m });
        } catch (err) {
            console.error("Slap Error:", err);
            await sock.sendMessage(m.key.remoteJid, { text: "❌ Failed to send slap GIF." }, { quoted: m });
        }
    }
};
