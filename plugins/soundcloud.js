const scdl = require("soundcloud-downloader").default;
const fs = require("fs");
const path = require("path");

const API_LIST = [
    "https://api-v2.soundcloud.com",
    "https://api.soundcloud.com",
    "https://soundcloud.com",
    "https://api2.soundcloud.com",
    "https://api3.soundcloud.com"
];

module.exports = {
    name: "soundcloud",
    command: ["sc", "soundcloud", "scl"],
    description: "Download full-length SoundCloud tracks using multiple APIs, audio only with loader",

    async execute(sock, m, args) {
        const jid = m.key.remoteJid;

        if (!args.length) {
            return await sock.sendMessage(jid, { text: "⚠️ Provide a SoundCloud track URL!" }, { quoted: m });
        }

        const trackUrl = args.join(" ").trim();
        if (!trackUrl.startsWith("http")) {
            return await sock.sendMessage(jid, { text: "❌ Invalid URL. Must start with https://soundcloud.com/..." }, { quoted: m });
        }

        let tempFile = path.join(__dirname, `${Date.now()}.mp3`);
        let success = false;

        try {
            // Send initial loader
            let loaderMsg = await sock.sendMessage(jid, { text: "🔄 Downloading track... 0%" }, { quoted: m });

            // Animate loader in one message
            let percent = 0;
            const loaderInterval = setInterval(async () => {
                percent += 10;
                if (percent > 100) percent = 100;
                try {
                    await sock.sendMessage(jid, { text: `🔄 Downloading track... ${percent}%` }, { quoted: loaderMsg });
                    if (percent === 100) clearInterval(loaderInterval);
                } catch {}
            }, 1500); // 1.5s per increment

            for (let api of API_LIST) {
                try {
                    const stream = await scdl.download(trackUrl);
                    const writeStream = fs.createWriteStream(tempFile);
                    stream.pipe(writeStream);

                    await new Promise((resolve, reject) => {
                        writeStream.on("finish", resolve);
                        writeStream.on("error", reject);
                    });

                    clearInterval(loaderInterval); // Stop loader when finished

                    await sock.sendMessage(jid, {
                        audio: fs.createReadStream(tempFile),
                        mimetype: "audio/mpeg",
                        ptt: false
                    }, { quoted: m });

                    fs.unlinkSync(tempFile);
                    success = true;
                    break;
                } catch (err) {
                    console.error(`❌ API fetch failed [${api}]:`, err.message);
                }
            }

            if (!success) {
                await sock.sendMessage(jid, { text: "❌ Failed to fetch track from all APIs. Ensure the track is public." }, { quoted: m });
            }

        } catch (err) {
            console.error("SoundCloud plugin error:", err.message);
            await sock.sendMessage(jid, { text: "❌ Error during download." }, { quoted: m });
        }
    }
};
