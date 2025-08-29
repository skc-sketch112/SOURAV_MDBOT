const axios = require("axios");

module.exports = {
    name: "song",
    command: ["song", "music", "play"],
    execute: async (sock, m, args) => {
        if (!args.length) {
            return await sock.sendMessage(m.key.remoteJid, { text: "❌ Please provide a song name!\nExample: .song despacito" }, { quoted: m });
        }

        const query = args.join(" ");
        const chatId = m.key.remoteJid;

        await sock.sendMessage(chatId, { text: `🎵 Searching for *${query}*...` }, { quoted: m });

        // ✅ 15+ APIs (manually added)
        const apis = [
            q => `https://vihangayt.me/download/ytmp3?q=${encodeURIComponent(q)}`,
            q => `https://api.dapuhy.xyz/api/socialmedia/ytplaymp3?query=${encodeURIComponent(q)}&apikey=freeapi`,
            q => `https://api.ryzendesu.vip/api/downloader/ytplaymp3?query=${encodeURIComponent(q)}&apikey=freeapi`,
            q => `https://api.zahwazein.xyz/downloader/ytplaymp3?query=${encodeURIComponent(q)}&apikey=freeapi`,
            q => `https://api.akuari.my.id/downloader/ytplay?query=${encodeURIComponent(q)}`,
            q => `https://api.itsrose.life/tools/ytmp3?url=${encodeURIComponent(q)}&apikey=freeapi`,
            q => `https://api.caliph.biz.id/api/ytplaymp3?query=${encodeURIComponent(q)}&apikey=freeapi`,
            q => `https://api.zeeoneofc.my.id/api/downloader/ytplay?text=${encodeURIComponent(q)}&apikey=freeapi`,
            q => `https://api.botcahx.live/api/dowloader/ytplay?text=${encodeURIComponent(q)}&apikey=freeapi`,
            q => `https://api.lolhuman.xyz/api/ytplay?apikey=freeapi&query=${encodeURIComponent(q)}`,
            q => `https://api.erdwpe.xyz/api/download/ytplay?query=${encodeURIComponent(q)}&apikey=freeapi`,
            q => `https://api.xcodeteam.xyz/api/ytplay?query=${encodeURIComponent(q)}&apikey=freeapi`,
            q => `https://api.siputzx.my.id/api/ytplay?search=${encodeURIComponent(q)}&apikey=freeapi`,
            q => `https://api.alphabot.biz.id/api/ytplaymp3?query=${encodeURIComponent(q)}&apikey=freeapi`,
            q => `https://widipe.com/download/ytplay?text=${encodeURIComponent(q)}&apikey=freeapi`,
            q => `https://api.nyxs.pw/ytplaymp3?text=${encodeURIComponent(q)}&apikey=freeapi`,
        ];

        let success = false;

        // 🔄 Loop all APIs until success
        for (let i = 0; i < apis.length; i++) {
            try {
                console.log(`⚡ Trying API ${i + 1} for query: ${query}`);
                let { data } = await axios.get(apis[i](query));

                // Normalize possible audio link fields
                let audioUrl =
                    data?.result?.url ||
                    data?.result?.download_url ||
                    data?.result?.audio ||
                    data?.result?.link ||
                    data?.result?.mp3 ||
                    data?.result?.result ||
                    null;

                if (audioUrl) {
                    await sock.sendMessage(chatId, {
                        audio: { url: audioUrl },
                        mimetype: "audio/mp4"
                    }, { quoted: m });

                    await sock.sendMessage(chatId, { text: `✅ Found song using API ${i + 1}` }, { quoted: m });
                    success = true;
                    break; // stop after success
                }
            } catch (e) {
                console.error(`❌ API ${i + 1} failed:`, e.message);
            }
        }

        // ❌ If all APIs failed
        if (!success) {
            await sock.sendMessage(chatId, { text: "⚠️ Sorry, could not fetch song. All APIs failed." }, { quoted: m });
        }
    }
};
