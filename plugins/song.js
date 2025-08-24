const axios = require("axios");

module.exports = {
    name: "song",
    command: ["song", "play", "music"],
    execute: async (sock, m, args) => {
        if (!args.length) {
            return sock.sendMessage(m.key.remoteJid, { 
                text: "❌ *Please enter a song name!*\n👉 Example: `.song Believer`" 
            }, { quoted: m });
        }

        const query = args.join(" ");

        // Multiple APIs for fallback
        const apis = [
            `https://api.yanzbotz.live/api/downloader/yt-play?query=${encodeURIComponent(query)}&apikey=guest`,
            `https://api-v2.nyxs.pw/api/downloader/yt-play?query=${encodeURIComponent(query)}&apikey=nyxs`,
            `https://api.zahwazein.xyz/api/downloader/ytplay?query=${encodeURIComponent(query)}&apikey=zenzkey`
        ];

        let song = null;

        for (const api of apis) {
            try {
                const res = await axios.get(api, { timeout: 10000 });
                if (res.data && res.data.result) {
                    song = res.data.result;
                    break;
                }
            } catch (e) {
                console.log(`⚠️ API failed: ${api}`);
            }
        }

        if (!song) {
            return sock.sendMessage(m.key.remoteJid, { 
                text: "🚫 All song APIs are down. Please try again later!" 
            }, { quoted: m });
        }

        try {
            // 🎨 Info Card
            await sock.sendMessage(m.key.remoteJid, {
                image: { url: song.thumbnail },
                caption: `✨ *Now Playing* ✨\n\n` +
                         `🎶 *Title:* ${song.title}\n` +
                         `📀 *Channel:* ${song.channel}\n` +
                         `⏱️ *Duration:* ${song.duration}\n` +
                         `👁️ *Views:* ${song.views || "N/A"}\n\n` +
                         `🔗 [YouTube Link](${song.url})\n\n` +
                         `⚡ _Powered by YourBot_`
            }, { quoted: m });

            // 🎵 Send Audio File
            await sock.sendMessage(m.key.remoteJid, {
                audio: { url: song.url },
                mimetype: "audio/mp4",
                fileName: `${song.title}.mp3`,
                ptt: false
            }, { quoted: m });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(m.key.remoteJid, { 
                text: "❌ Failed to send song audio!" 
            }, { quoted: m });
        }
    }
};
