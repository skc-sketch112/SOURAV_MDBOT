const youtubedl = require("youtube-dl-exec");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "song",
  command: ["song", "play", "music"],
  execute: async (sock, m, args) => {
    try {
      if (!args[0]) {
        return sock.sendMessage(m.key.remoteJid, { 
          text: "❌ Enter song name or YouTube link." 
        }, { quoted: m });
      }

      let query = args.join(" ");
      let videoInfo, videoUrl;

      // ✅ If it's already a YouTube link
      if (query.includes("youtu")) {
        videoUrl = query;
        const search = await yts({ videoId: new URL(videoUrl).searchParams.get("v") });
        videoInfo = search.videos?.[0];
      } else {
        // ✅ Otherwise search by song name
        const search = await yts(query);
        videoInfo = search.videos?.[0];
        if (!videoInfo) {
          return sock.sendMessage(m.key.remoteJid, { text: "⚠️ No results found" }, { quoted: m });
        }
        videoUrl = videoInfo.url;
      }

      // Send info first
      await sock.sendMessage(m.key.remoteJid, {
        image: { url: videoInfo.thumbnail },
        caption: `🎶 *${videoInfo.title}*\n⏱: ${videoInfo.timestamp}\n👁: ${videoInfo.views.toLocaleString()}\n🔗 ${videoUrl}`
      }, { quoted: m });

      // Temp file for download
      const tmpFile = path.join(__dirname, "song.mp3");

      // ✅ Download as MP3 with BEST quality
      await youtubedl(videoUrl, {
        extractAudio: true,
        audioFormat: "mp3",
        audioQuality: "0",   // 0 = best
        output: tmpFile,
        noCheckCertificates: true,
        noWarnings: true,
        preferFreeFormats: true
      });

      // ✅ Send audio
      await sock.sendMessage(m.key.remoteJid, {
        audio: fs.readFileSync(tmpFile),
        mimetype: "audio/mpeg",
        fileName: `${videoInfo.title}.mp3`
      }, { quoted: m });

      fs.unlinkSync(tmpFile); // cleanup
    } catch (err) {
      console.error(err);
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Error downloading song." }, { quoted: m });
    }
  }
};
