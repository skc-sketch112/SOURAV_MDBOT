// plugins/song.js
const fs = require("fs");
const path = require("path");
const ytdl = require("ytdl-core");
const yts = require("yt-search");
const scdl = require("soundcloud-downloader").default;

module.exports = {
  name: "song",
  command: ["song", "play"],
  description: "Download unlimited songs from YouTube or SoundCloud",
  execute: async (sock, m, args) => {
    try {
      if (!args[0]) {
        return sock.sendMessage(m.key.remoteJid, { text: "❌ Please provide a song name or URL." }, { quoted: m });
      }

      const query = args.join(" ");
      let finalUrl, title, channel, thumbnail, duration;

      try {
        // ---------- TRY YOUTUBE ----------
        if (ytdl.validateURL(query)) {
          finalUrl = query;
        } else {
          const search = await yts(query);
          if (!search.videos.length) throw new Error("No YouTube result");
          finalUrl = search.videos[0].url;
        }

        const info = await ytdl.getInfo(finalUrl);
        title = info.videoDetails.title;
        channel = info.videoDetails.author.name;
        thumbnail = info.videoDetails.thumbnails.pop().url;
        duration = info.videoDetails.lengthSeconds;

        const filePath = path.join(__dirname, `${Date.now()}.mp3`);
        const stream = ytdl(finalUrl, { filter: "audioonly", quality: "highestaudio" })
          .pipe(fs.createWriteStream(filePath));

        await new Promise((resolve, reject) => {
          stream.on("finish", resolve);
          stream.on("error", reject);
        });

        await sock.sendMessage(m.key.remoteJid, {
          image: { url: thumbnail },
          caption: `🎶 *${title}*\n👤 ${channel}\n⏱ ${Math.floor(duration / 60)}:${duration % 60}\n✅ Source: YouTube`
        }, { quoted: m });

        await sock.sendMessage(m.key.remoteJid, {
          audio: { url: filePath },
          mimetype: "audio/mpeg",
          fileName: `${title}.mp3`
        }, { quoted: m });

        fs.unlinkSync(filePath);
        return;

      } catch (youtubeErr) {
        console.log("❌ YouTube failed, trying SoundCloud...", youtubeErr.message);
      }

      // ---------- FALLBACK: SOUNDCLOUD ----------
      try {
        const scTrack = await scdl.search({ query, limit: 1 });
        if (!scTrack || !scTrack.collection.length) {
          return sock.sendMessage(m.key.remoteJid, { text: "❌ No results found on SoundCloud." }, { quoted: m });
        }

        const track = scTrack.collection[0];
        const filePath = path.join(__dirname, `${Date.now()}.mp3`);
        const stream = await scdl.download(track.permalink_url);

        const file = fs.createWriteStream(filePath);
        stream.pipe(file);

        await new Promise((resolve, reject) => {
          file.on("finish", resolve);
          file.on("error", reject);
        });

        await sock.sendMessage(m.key.remoteJid, {
          image: { url: track.artwork_url || track.user.avatar_url },
          caption: `🎶 *${track.title}*\n👤 ${track.user.username}\n✅ Source: SoundCloud`
        }, { quoted: m });

        await sock.sendMessage(m.key.remoteJid, {
          audio: { url: filePath },
          mimetype: "audio/mpeg",
          fileName: `${track.title}.mp3`
        }, { quoted: m });

        fs.unlinkSync(filePath);
      } catch (scErr) {
        console.error("❌ SoundCloud also failed:", scErr.message);
        sock.sendMessage(m.key.remoteJid, { text: "⚠️ Could not fetch song from any source." }, { quoted: m });
      }

    } catch (err) {
      console.error("SONG COMMAND ERROR:", err);
      sock.sendMessage(m.key.remoteJid, { text: "⚠️ Something went wrong while fetching the song." }, { quoted: m });
    }
  }
};
