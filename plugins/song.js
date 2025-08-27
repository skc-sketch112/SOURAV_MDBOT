const ytdl = require("ytdl-core");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "song",
  command: ["song", "music"],
  description: "Download a song from YouTube by name or URL.",

  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;

    try {
      if (!args[0]) {
        return sock.sendMessage(jid, {
          text: "❌ Please provide a song name or YouTube link.\n\nExample: `.song despacito`"
        }, { quoted: msg });
      }

      let query = args.join(" ");
      let url;

      // If user typed a YouTube URL
      if (ytdl.validateURL(query)) {
        url = query;
      } else {
        // Search YouTube
        let search = await yts(query);
        if (!search.videos.length) {
          return sock.sendMessage(jid, { text: "❌ No results found." }, { quoted: msg });
        }
        url = search.videos[0].url;
      }

      const info = await ytdl.getInfo(url);
      const title = info.videoDetails.title.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
      const outputPath = path.join(__dirname, `${title}_${Date.now()}.mp3`);

      // Download audio only
      await new Promise((resolve, reject) => {
        const stream = ytdl(url, {
          filter: "audioonly",
          quality: "highestaudio",
          highWaterMark: 1 << 25
        }).pipe(fs.createWriteStream(outputPath));

        stream.on("finish", resolve);
        stream.on("error", reject);
      });

      const stats = fs.statSync(outputPath);

      // WhatsApp max size ~16MB
      if (stats.size > 16 * 1024 * 1024) {
        fs.unlinkSync(outputPath);
        return sock.sendMessage(jid, { text: "⚠️ File too large for WhatsApp (max 16MB)." }, { quoted: msg });
      }

      // Send song
      await sock.sendMessage(jid, {
        audio: { url: outputPath },
        mimetype: "audio/mpeg"
      }, { quoted: msg });

      // Cleanup
      fs.unlinkSync(outputPath);

    } catch (err) {
      console.error("Song error:", err);
      await sock.sendMessage(jid, {
        text: "❌ Failed to fetch the song. Try again later!"
      }, { quoted: msg });
    }
  }
};
