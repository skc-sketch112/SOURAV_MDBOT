const axios = require("axios");

module.exports = {
    name: "song",
    command: ["song"],
    execute: async (sock, m, args) => {
        try {
            if (!args[0]) {
                return sock.sendMessage(m.key.remoteJid, { text: "❌ Please provide a song name." }, { quoted: m });
            }

            const query = args.join(" ");

            // Step 1: Search song
            const search = await axios.get(`https://api.vreden.my.id/api/ytsearch?text=${encodeURIComponent(query)}`);
            if (!search.data || !search.data[0]) {
                return sock.sendMessage(m.key.remoteJid, { text: "⚠️ No results found." }, { quoted: m });
            }

            const video = search.data[0];
            const url = video.url;

            // Step 2: Get download link (not raw audio yet)
            const dl = await axios.get(`https://api.vreden.my.id/api/ytdl?url=${encodeURIComponent(url)}&filter=audioonly&quality=highestaudio`);

            if (!dl.data || !dl.data.url) {
                return sock.sendMessage(m.key.remoteJid, { text: "⚠️ Download link failed." }, { quoted: m });
            }

            // Step 3: Download the actual MP3 file
            const audioFile = await axios.get(dl.data.url, { responseType: "arraybuffer" });

            // Step 4: Send to WhatsApp
            await sock.sendMessage(
                m.key.remoteJid,
                {
                    audio: audioFile.data,
                    mimetype: "audio/mpeg",
                    fileName: `${video.title}.mp3`
                },
                { quoted: m }
            );

        } catch (err) {
            console.error("Song command error:", err.message);
            await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Error downloading song. Try again later." }, { quoted: m });
        }
    },
};
