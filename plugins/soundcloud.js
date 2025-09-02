const scdl = require("soundcloud-downloader").default;
const fs = require("fs");
const path = require("path");
const ytdl = require("ytdl-core"); // fallback for audio

module.exports = {
    name: "soundcloud",
    command: ["sc", "soundcloud", "scl"],
    description: "Download full SoundCloud tracks (fallback YouTube if fail)",

    async execute(sock, m, args) {
        const jid = m.key.remoteJid;

        if (!args.length) {
            return await sock.sendMessage(jid, { text: "⚠️ Provide a SoundCloud link!" }, { quoted: m });
        }

        const trackUrl = args.join(" ").trim();
        const tempFile = path.join(__dirname, `${Date.now()}.mp3`);

        // Loader animation
        let loaderMsg = await sock.sendMessage(jid, { text: "🔎 Fetching track... 0%" }, { quoted: m });
        let percent = 0;
        const interval = setInterval(async () => {
            percent += 20;
            if (percent > 100) percent = 100;
            try {
                await sock.sendMessage(jid, { text: `⏳ Downloading... ${percent}%` }, { quoted: loaderMsg });
                if (percent === 100) clearInterval(interval);
            } catch {}
        }, 1200);

        try {
            // Try SoundCloud first
            const stream = await scdl.download(trackUrl);
            const writeStream = fs.createWriteStream(tempFile);
            stream.pipe(writeStream);

            await new Promise((resolve, reject) => {
                writeStream.on("finish", resolve);
                writeStream.on("error", reject);
            });

        } catch (err) {
            console.log("⚠️ SoundCloud failed, trying fallback:", err.message);

            // Fallback: use YouTube (search link must be provided manually if SC fails)
            if (ytdl.validateURL(trackUrl)) {
                const ytStream = ytdl(trackUrl, { filter: "audioonly", quality: "highestaudio" });
                const writeStream = fs.createWriteStream(tempFile);
                ytStream.pipe(writeStream);

                await new Promise((resolve, reject) => {
                    writeStream.on("finish", resolve);
                    writeStream.on("error", reject);
                });
            } else {
                clearInterval(interval);
                return await sock.sendMessage(jid, { text: "❌ Failed to fetch track. Provide a valid SoundCloud/YouTube link." }, { quoted: m });
            }
        }

        clearInterval(interval);

        // Send audio file
        await sock.sendMessage(jid, {
            audio: fs.createReadStream(tempFile),
            mimetype: "audio/mpeg",
            ptt: false
        }, { quoted: m });

        fs.unlinkSync(tempFile);
    }
};
