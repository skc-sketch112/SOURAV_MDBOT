const scdl = require("soundcloud-downloader").default;
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "soundcloud",
    command: ["sc", "soundcloud"],
    description: "Download full SoundCloud tracks by link or search",

    async execute(sock, m, args) {
        const jid = m.key.remoteJid;

        if (!args.length) {
            return await sock.sendMessage(
                jid,
                { text: "⚠️ Provide a SoundCloud link or song name!\n\nExample: `.sc https://soundcloud.com/artist/song`" },
                { quoted: m }
            );
        }

        const query = args.join(" ");

        try {
            let streamUrl;

            // If it's a valid SoundCloud link
            if (query.startsWith("https://soundcloud.com")) {
                streamUrl = await scdl.getInfo(query).then(info => info.permalink_url);
            } else {
                // Optional: Search via SoundCloud API or fallback
                return await sock.sendMessage(
                    jid,
                    { text: "⚠️ Only direct SoundCloud links are supported for now." },
                    { quoted: m }
                );
            }

            // Download temporary file
            const tempFile = path.join(__dirname, `${Date.now()}.mp3`);
            const stream = await scdl.download(query);

            const writeStream = fs.createWriteStream(tempFile);
            stream.pipe(writeStream);

            writeStream.on("finish", async () => {
                await sock.sendMessage(
                    jid,
                    {
                        audio: fs.createReadStream(tempFile),
                        mimetype: "audio/mpeg",
                        ptt: false
                    },
                    { quoted: m }
                );

                fs.unlinkSync(tempFile); // Remove temp file after sending
            });

        } catch (err) {
            console.error("SoundCloud plugin error:", err.message);
            await sock.sendMessage(
                jid,
                { text: "❌ Failed to fetch the SoundCloud track. Make sure the link is valid." },
                { quoted: m }
            );
        }
    }
};
