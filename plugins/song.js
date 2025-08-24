const play = require("play-dl");
const scdl = require("soundcloud-downloader").default;
const axios = require("axios");
const fs = require("fs");
const ytdl = require("ytdl-core");

module.exports = {
    name: "song",
    command: ["song", "play"],
    execute: async (sock, m, args) => {
        if (!args || args.length === 0) {
            return await sock.sendMessage(m.key.remoteJid, { text: "❌ Please give me a song name!" }, { quoted: m });
        }

        let query = args.join(" ");
        let jid = m.key.remoteJid;

        try {
            // === TRY YOUTUBE FIRST ===
            let ytInfo = await play.search(query, { limit: 1 });
            if (ytInfo.length > 0) {
                let yt = ytInfo[0];
                let stream = ytdl(yt.url, { filter: "audioonly", quality: "highestaudio" });

                const filePath = `./${Date.now()}.mp3`;
                const writeStream = fs.createWriteStream(filePath);
                stream.pipe(writeStream);

                writeStream.on("finish", async () => {
                    await sock.sendMessage(jid, {
                        audio: { url: filePath },
                        mimetype: "audio/mpeg",
                        ptt: false,
                        caption: `🎵 *${yt.title}*\n👤 ${yt.channel?.name || "Unknown"}\n📀 Source: YouTube`
                    }, { quoted: m });
                    fs.unlinkSync(filePath);
                });
                return;
            }

            throw new Error("YouTube failed");

        } catch (err) {
            console.log("YouTube error, trying SoundCloud...", err.message);

            // === FALLBACK: SOUNDCLOUD ===
            try {
                const scTrack = await scdl.search(query);
                if (scTrack && scTrack.collection.length > 0) {
                    let track = scTrack.collection[0];
                    let filePath = `./${Date.now()}.mp3`;
                    await scdl.download(track.permalink_url).then(stream => {
                        stream.pipe(fs.createWriteStream(filePath)).on("finish", async () => {
                            await sock.sendMessage(jid, {
                                audio: { url: filePath },
                                mimetype: "audio/mpeg",
                                caption: `🎶 *${track.title}*\n👤 ${track.user.username}\n📀 Source: SoundCloud`
                            }, { quoted: m });
                            fs.unlinkSync(filePath);
                        });
                    });
                    return;
                }
                throw new Error("SoundCloud failed");
            } catch (err2) {
                console.log("SoundCloud error, trying JioSaavn...", err2.message);

                // === LAST RESORT: JIOSAAVN ===
                try {
                    let res = await axios.get(`https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}`);
                    let song = res.data.data.results[0];
                    if (song) {
                        await sock.sendMessage(jid, {
                            audio: { url: song.downloadUrl[4].link },
                            mimetype: "audio/mpeg",
                            caption: `🎧 *${song.name}*\n👤 ${song.primaryArtists}\n📀 Source: JioSaavn`
                        }, { quoted: m });
                        return;
                    }
                } catch (err3) {
                    console.log("JioSaavn failed", err3.message);
                }
            }
        }

        // If everything fails
        await sock.sendMessage(jid, { text: "⚠️ Sorry, I couldn’t fetch this song. Try another name!" }, { quoted: m });
    }
};
