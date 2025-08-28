const kissGIFs = [
    "https://media.giphy.com/media/G3va31oEEnIkM/giphy.mp4",
    "https://media.giphy.com/media/bGm9FuBCGg4SY/giphy.mp4",
    "https://media.giphy.com/media/FqBTvSNjNzeZG/giphy.mp4"
];

module.exports = {
    name: "throwkiss",
    command: [ "throwkiss"],
    description: "Throw a kiss to someone randomly. Powered by SOURAV_,MD",
    async execute(sock, m, args) {
        const jid = m.key.remoteJid;
        if (!jid.endsWith("@g.us")) return sock.sendMessage(jid, { text: "❌ Works only in groups!" }, { quoted: m });

        const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const targetUser = mentioned[0] || m.sender;

        const randomGIF = kissGIFs[Math.floor(Math.random() * kissGIFs.length)];

        await sock.sendMessage(jid, {
            video: { url: randomGIF },
            mimetype: "video/mp4",
            gifPlayback: true,
            caption: `😘 @${targetUser.split("@")[0]} got a kiss!`,
            mentions: [targetUser]
        }, { quoted: m });
    }
};
