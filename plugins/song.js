// song.js - Advanced YouTube Audio Downloader Plugin
const ytdl = require("ytdl-core");
const playdl = require("play-dl");
const ytSearch = require("yt-search");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
ffmpeg.setFfmpegPath(ffmpegPath);

module.exports = {
  name: "song",
  command: ["song", "play", "music"],
  description: "Download and send high-quality MP3 audio from YouTube.",

  async execute(sock, m, args, { axios, fetch }) {
    const jid = m.key.remoteJid;
    console.log(`[Song] Command received: ${m.body} from ${jid}`);

    if (!args[0]) {
      return sock.sendMessage(jid, { text: "❌ দয়া করে গানের নাম বা YouTube URL দিন।\nউদাহরণ: `.song despacito` বা `.song https://www.youtube.com/watch?v=kJQP7kiw5Fk`" }, { quoted: m });
    }

    const query = args.join(" ");
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        // Search or validate URL
        let url;
        let title = "Unknown Title";
        if (ytdl.validateURL(query)) {
          url = query;
          const info = await ytdl.getInfo(url);
          title = info.videoDetails.title;
        } else {
          console.log(`[Song] Searching for: ${query}`);
          const search = await ytSearch(query);
          if (!search.videos.length) {
            return sock.sendMessage(jid, { text: "❌ কোন ফলাফল পাওয়া যায়নি।" }, { quoted: m });
          }
          url = search.videos[attempts % search.videos.length].url;
          title = search.videos[attempts % search.videos.length].title;
          console.log(`[Song] Selected: ${title} (${url})`);
        }

        // Notify user
        await sock.sendMessage(jid, { text: `🎶 *${title}* ডাউনলোড হচ্ছে...\n⏳ দয়া করে অপেক্ষা করুন...` }, { quoted: m });

        // Create downloads folder
        const downloadsDir = path.join(__dirname, "../downloads");
        if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });
        const outFile = path.join(downloadsDir, `${Date.now()}.mp3`);

        // Try ytdl-core first
        let downloaded = false;
        try {
          const stream = ytdl(url, { filter: "audioonly", quality: "highestaudio" });
          await new Promise((resolve, reject) => {
            ffmpeg(stream)
              .audioBitrate(128)
              .format("mp3")
              .save(outFile)
              .on("end", resolve)
              .on("error", reject);
          });
          downloaded = true;
        } catch (ytdlErr) {
          console.error(`[Song] ytdl-core failed: ${ytdlErr.message}`);
        }

        // Fallback to play-dl
        if (!downloaded) {
          console.log("[Song] Falling back to play-dl");
          if (playdl.is_expired()) await playdl.refreshToken();
          const stream = await playdl.stream(url, { quality: 2 });
          const writer = fs.createWriteStream(outFile);
          stream.stream.pipe(writer);
          await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
          });
        }

        // Verify file
        if (!fs.existsSync(outFile) || fs.statSync(outFile).size === 0) {
          throw new Error("Failed to download or convert audio.");
        }

        // Send MP3
        const media = { url: outFile, mimetype: "audio/mpeg", filename: `${title}.mp3` };
        await sock.sendMessage(jid, { audio: media }, { quoted: m });

        // Clean up
        fs.unlinkSync(outFile);
        console.log(`[Song] Cleaned up: ${outFile}`);
        return; // Success
      } catch (err) {
        console.error(`[Song] Attempt ${attempts + 1} failed: ${err.message}`);
        attempts++;
        if (attempts >= maxAttempts) {
          await sock.sendMessage(jid, { text: `❌ গান ডাউনলোড করতে ব্যর্থ।\nকারণ: ${err.message}\nঅন্য গান বা URL চেষ্টা করুন।` }, { quoted: m });
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay
      }
    }
  }
};
