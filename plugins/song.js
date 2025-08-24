const axios = require("axios");

module.exports = {
    name: "song",
    command: ["song", "play", "music"],
    execute: async (sock, m, args) => {
        try {
            if (!args.length) {
                return sock.sendMessage(m.key.remoteJid, { 
                    text: "❌ *Please enter a song name!*\n\n👉 Example: `.song Perfect`" 
                }, { quoted: m });
            }

            const query = args.join(" ");
            const api = `https://api.yanzbotz.live/api/downloader/yt-play?query=${encodeURIComponent(query)}&apikey=guest`;

            const res = await axios.get(api);
            if (!res.data || !res.data.result) {
                return sock.sendMessage(m.key.remoteJid, { 
                    text: "⚠️ Song not found! Try another name." 
                }, { quoted: m });
            }

            const song = res.data.result;

            // 🎨 Beautiful Info Card
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
                ptt: false  // set true if you want as voice note
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            await sock.sendMessage(m.key.remoteJid, { 
                text: "❌ Error fetching song. Please try again later!" 
            }, { quoted: m });
        }
    }
};
