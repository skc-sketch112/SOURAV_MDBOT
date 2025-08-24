const ytdl = require("youtube-dl-exec");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "song",
    command: ["song"],
    execute: async (sock, m, args) => {
        try {
            if (!args[0]) {
                await sock.sendMessage(m.key.remoteJid, { text: "⚡ Please provide a song name or YouTube link!\n\nExample:\n.song despacito\n.song https://youtu.be/kJQP7kiw5Fk" }, { quoted: m });
                return;
            }

            const query = args.join(" ");
            const outputFile = path.join(__dirname, "song.mp3");

            await sock.sendMessage(m.key.remoteJid, { text: `🔎 Searching & downloading: *${query}* ...` }, { quoted: m });

            // If user gives YouTube link directly
            const options = query.startsWith("http")
                ? { extractAudio: true, audioFormat: "mp3", audioQuality: 0, output: outputFile }
                : { extractAudio: true, audioFormat: "mp3", audioQuality: 0, output: outputFile, defaultSearch: "ytsearch1" };

            await ytdl(query, options);

            const audio = fs.readFileSync(outputFile);

            await sock.sendMessage(m.key.remoteJid, {
                audio: audio,
                mimetype: "audio/mpeg",
                fileName: `${query}.mp3`
            }, { quoted: m });

            fs.unlinkSync(outputFile); // clean up

        } catch (err) {
            console.error("Song command error:", err);
            await sock.sendMessage(m.key.remoteJid, { text: `❌ Failed to download: ${err.message}` }, { quoted: m });
        }
    }
};
