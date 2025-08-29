const axios = require("axios");

module.exports = {
    name: "song",
    alias: ["play", "music"],
    desc: "Download full song from multiple APIs (auto retry until success)",
    category: "media",
    usage: ".song <song name>",
    react: "🎵",

    start: async (sock, m, { text, pushName }) => {
        if (!text) return sock.sendMessage(m.chat, { text: "❌ Please provide a song name!" }, { quoted: m });

        const apis = [
            q => `https://api.videodlserver.com/song?query=${encodeURIComponent(q)}`,
            q => `https://api.songsearch.ai/play?name=${encodeURIComponent(q)}`,
            q => `https://musicapi-one.vercel.app/api/song/${encodeURIComponent(q)}`,
            q => `https://api.lavalink.dev/song?track=${encodeURIComponent(q)}`,
            q => `https://fastdl-api.vercel.app/music?query=${encodeURIComponent(q)}`,
            q => `https://songapi-xi.vercel.app/api/play?search=${encodeURIComponent(q)}`,
            q => `https://hikarinoapi.vercel.app/song?name=${encodeURIComponent(q)}`,
            q => `https://audiograbber.vercel.app/api/download/${encodeURIComponent(q)}`,
            q => `https://musicscraper.vercel.app/api/song?search=${encodeURIComponent(q)}`,
            q => `https://dl-song.vercel.app/download?title=${encodeURIComponent(q)}`,
            q => `https://muzicapi.vercel.app/song/${encodeURIComponent(q)}`,
            q => `https://saavnapi.vercel.app/search/song?query=${encodeURIComponent(q)}`,
            q => `https://spotifydlapi.vercel.app/song?title=${encodeURIComponent(q)}`,
            q => `https://musicfetch.vercel.app/api/play?query=${encodeURIComponent(q)}`,
            q => `https://ytmusicapi.vercel.app/song?search=${encodeURIComponent(q)}`
        ];

        let success = false;

        sock.sendMessage(m.chat, { text: `🔎 Searching for "${text}" across 15 APIs...` }, { quoted: m });

        while (!success) { // 🔁 infinite retry until any API gives valid song
            for (let i = 0; i < apis.length; i++) {
                try {
                    let url = apis[i](text);
                    console.log(`⚡ Trying API ${i + 1}: ${url}`);

                    let res = await axios.get(url, { timeout: 15000 });
                    if (!res.data) continue;

                    let songUrl = res.data.url || res.data.download || res.data.result || null;
                    if (!songUrl) continue;

                    await sock.sendMessage(m.chat, {
                        audio: { url: songUrl },
                        mimetype: "audio/mpeg",
                        fileName: `${text}.mp3`
                    }, { quoted: m });

                    await sock.sendMessage(m.chat, { text: `✅ Found & sent from API ${i + 1}` }, { quoted: m });
                    success = true;
                    break;
                } catch (e) {
                    console.log(`❌ API ${i + 1} failed: ${e.message}`);
                }
            }
        }
    }
};
