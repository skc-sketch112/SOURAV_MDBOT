const feedGIFs = [
    "https://media.giphy.com/media/3o7TKP6r5ZKqMxkL6s/giphy.mp4",
    "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.mp4",
    "https://media.giphy.com/media/Q9kBq7Lb0we6M/giphy.mp4"
];

module.exports = {
    name: "feed",
    command: ["feed"],
    description: "Feed someone with a GIF in group chat. Powered by SOURAV_,MD",
    async execute(sock, m, args) {
        const jid = m.key.remoteJid;
        if (!jid.endsWith("@g.us")) return sock.sendMessage(jid, { text: "❌ Works only in groups!" }, { quoted: m });

        const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const targetUser = mentioned[0] || m.sender;

        const randomGIF = feedGIFs[Math.floor(Math.random() * feedGIFs.length)];

        await sock.sendMessage(jid, {
            video: { url: randomGIF },
            mimetype: "video/mp4",
            gifPlayback: true,
            caption: `🍲 Feeding @${targetUser.split("@")[0]}!`,
            mentions: [targetUser]
        }, { quoted: m });
    }
};
