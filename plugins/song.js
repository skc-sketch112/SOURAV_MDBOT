const axios = require("axios");

// helper delay function
const delay = ms => new Promise(res => setTimeout(res, ms));

module.exports = {
    name: "song",
    alias: ["play", "music"],
    desc: "Download full song (loop through APIs until success)",
    category: "media",
    usage: ".song <song name>",
    react: "🎵",

    start: async (sock, m, { text }) => {
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

        sock.sendMessage(m.chat, { text: `🔎 Searching "${text}"... I will keep trying until I find it ✅` }, { quoted: m });

        let found = false;
        let round = 0;

        while (!found) {
            round++;
            for (let i = 0; i < apis.length; i++) {
                try {
                    let url = apis[i](text);
                    console.log(`⚡ Round ${round} | Trying API ${i + 1}: ${url}`);

                    let res = await axios.get(url, { timeout: 10000 });
                    if (!res.data) continue;

                    let songUrl = res.data.url || res.data.download || res.data.result || res.data.link || res.data.song || res.data.audio || null;
                    if (!songUrl) continue;

                    await sock.sendMessage(m.chat, {
                        audio: { url: songUrl },
                        mimetype: "audio/mpeg",
                        fileName: `${text}.mp3`
                    }, { quoted: m });

                    await sock.sendMessage(m.chat, { text: `✅ Found song on Round ${round}, API ${i + 1}` }, { quoted: m });
                    found = true;
                    break;
                } catch (e) {
                    console.log(`❌ API ${i + 1} failed in Round ${round}: ${e.message}`);
                }
            }

            if (!found) {
                await sock.sendMessage(m.chat, { text: `⚠️ Still searching... Round ${round} failed, retrying...` }, { quoted: m });
                await delay(3000); // wait 3s before next loop
            }
        }
    }
};
