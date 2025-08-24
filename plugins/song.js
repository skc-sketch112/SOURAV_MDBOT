const axios = require("axios");

module.exports = {
    name: "song",
    command: ["song"],
    execute: async (sock, m, args) => {
        try {
            if (!args[0]) {
                return sock.sendMessage(
                    m.key.remoteJid,
                    { text: "❌ Please provide a song name." },
                    { quoted: m }
                );
            }

            const query = args.join(" ");

            // Step 1: Search song
            const search = await axios.get(
                `https://api.vreden.my.id/api/ytsearch?text=${encodeURIComponent(query)}`
            );

            if (!search.data || !search.data[0]) {
                return sock.sendMessage(
                    m.key.remoteJid,
                    { text: "⚠️ No results found." },
                    { quoted: m }
                );
            }

            const video = search.data[0]; // first result
            const url = video.url;

            // Step 2: Download audio
            const dl = await axios.get(
                `https://api.vreden.my.id/api/ytdl?url=${encodeURIComponent(url)}&filter=audioonly&quality=highestaudio`,
                { responseType: "arraybuffer" }
            );

            // Step 3: Send audio
            await sock.sendMessage(
                m.key.remoteJid,
                {
                    audio: dl.data,
                    mimetype: "audio/mpeg",
                    fileName: `${video.title}.mp3`,
                },
                { quoted: m }
            );

        } catch (err) {
            console.error("Song command error:", err.message);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Error while downloading song. Try again later." },
                { quoted: m }
            );
        }
    },
};
