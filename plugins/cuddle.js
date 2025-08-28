const cuddleGIFs = [
    "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.mp4",
    "https://media.giphy.com/media/3ZnBrkqoaI2hq/giphy.mp4",
    "https://media.giphy.com/media/wnsgren9NtITS/giphy.mp4"
];

module.exports = {
    name: "cuddle",
    command: ["cuddle"],
    description: "Send a random cuddle GIF in group chat. Powered by SOURAV_,MD",
    async execute(sock, m, args) {
        const jid = m.key.remoteJid;
        if (!jid.endsWith("@g.us")) return sock.sendMessage(jid, { text: "❌ Works only in groups!" }, { quoted: m });

        const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const targetUser = mentioned[0] || m.sender;

        const randomGIF = cuddleGIFs[Math.floor(Math.random() * cuddleGIFs.length)];

        await sock.sendMessage(jid, {
            video: { url: randomGIF },
            mimetype: "video/mp4",
            gifPlayback: true,
            caption: `🤗 Cuddle for @${targetUser.split("@")[0]}!`,
            mentions: [targetUser]
        }, { quoted: m });
    }
};
