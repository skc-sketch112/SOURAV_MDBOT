const axios = require("axios");

module.exports = {
    name: "song",
    command: ["song"],
    execute: async (sock, m, args) => {
        if (!args[0]) {
            await sock.sendMessage(m.key.remoteJid, { text: "⚡ Please provide a song name!\n\nExample:\n.song despacito" }, { quoted: m });
            return;
        }

        const query = args.join(" ");
        await sock.sendMessage(m.key.remoteJid, { text: `🔎 Searching for: *${query}* ...` }, { quoted: m });

        let audioUrl = null;

        try {
            // ✅ API 1: DreadedAPI
            const dread = await axios.get(`https://api.dreadedapi.com/youtube/playmp3?q=${encodeURIComponent(query)}`);
            if (dread.data?.result?.download_url) {
                audioUrl = dread.data.result.download_url;
            }
        } catch {}

        if (!audioUrl) {
            try {
                // ✅ API 2: Itzpire
                const itzpire = await axios.get(`https://itzpire.com/download/ytmp3?url=https://youtube.com/watch?v=kJQP7kiw5Fk`);
                if (itzpire.data?.result?.link) {
                    audioUrl = itzpire.data.result.link;
                }
            } catch {}
        }

        if (!audioUrl) {
            try {
                // ✅ API 3: MiftahGanzz
                const miftah = await axios.get(`https://api-v1.miftahganzz.com/api/ytmp3?url=https://youtube.com/watch?v=kJQP7kiw5Fk&apikey=demo`);
                if (miftah.data?.result?.link) {
                    audioUrl = miftah.data.result.link;
                }
            } catch {}
        }

        if (!audioUrl) {
            await sock.sendMessage(m.key.remoteJid, { text: "❌ Sorry, all APIs failed. Try again later!" }, { quoted: m });
            return;
        }

        // ✅ Send audio
        await sock.sendMessage(m.key.remoteJid, {
            audio: { url: audioUrl },
            mimetype: "audio/mpeg",
            fileName: `${query}.mp3`
        }, { quoted: m });
    }
};
