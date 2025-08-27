// song.js - Advanced YouTube Audio Downloader Plugin for WhatsApp Bot
// Supports song names, URLs, and high-quality MP3 downloads with fallback

const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
ffmpeg.setFfmpegPath(ffmpegPath);

module.exports = {
  name: "song",
  command: ["song", "play", "music"],
  description: "Download and send high-quality MP3 audio from YouTube. Supports search queries and direct URLs.",

  async execute(sock, m, args, { axios, fetch }) {
    const jid = m.key.remoteJid;
    if (!args[0]) {
      return sock.sendMessage(jid, { text: "❌ Please provide a song name or YouTube URL.\nExample: `.song despacito` or `.song https://www.youtube.com/watch?v=kJQP7kiw5Fk`" }, { quoted: m });
    }

    const query = args.join(" ");
    try {
      // Search or validate URL
      let url;
      if (ytdl.validateURL(query)) {
        url = query;
      } else {
        const search = await ytSearch(query);
        if (!search.videos.length) {
          return sock.sendMessage(jid, { text: "❌ No results found." }, { quoted: m });
        }
        url = search.videos[0].url;
      }

      // Get video info for title
      const info = await ytdl.getInfo(url);
      const title = info.videoDetails.title || "Unknown Title";

      // Notify user
      await sock.sendMessage(jid, { text: `🎶 Downloading *${title}*...\n⏳ Please wait...` }, { quoted: m });

      // Create downloads folder
      const downloadsDir = path.join(__dirname, "../downloads");
      if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });
      const outFile = path.join(downloadsDir, `${Date.now()}.mp3`);

      // Download audio stream
      const stream = ytdl(url, { filter: "audioonly", quality: "highestaudio" });

      // Convert to MP3 using fluent-ffmpeg
      await new Promise((resolve, reject) => {
        ffmpeg(stream)
          .audioBitrate(128)
          .format("mp3")
          .save(outFile)
          .on("end", resolve)
          .on("error", reject);
      });

      // Verify file
      if (!fs.existsSync(outFile) || fs.statSync(outFile).size === 0) {
        throw new Error("Failed to download or convert audio.");
      }

      // Send MP3
      await sock.sendMessage(jid, {
        audio: { url: outFile },
        mimetype: "audio/mpeg",
        fileName: `${title}.mp3`
      }, { quoted: m });

      // Clean up
      fs.unlinkSync(outFile);
    } catch (err) {
      console.error("[Song Error]:", err.message);
      await sock.sendMessage(jid, { text: `❌ Failed to process song.\nError: ${err.message}\nTry another song or URL.` }, { quoted: m });
    }
  }
};
