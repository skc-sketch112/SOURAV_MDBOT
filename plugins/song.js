// song.js - Advanced YouTube Audio Downloader Plugin with Thumbnail
const ytdl = require("@distube/ytdl-core");
const ytSearch = require("yt-search");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const ProxyAgent = require("proxy-agent");

ffmpeg.setFfmpegPath(ffmpegPath);

module.exports = {
  name: "song",
  command: ["song", "play", "music"],
  description: "Download and send MP3 audio from YouTube with thumbnail.",

  async execute(sock, m, args, { axios, fetch }) {
    const jid = m.key.remoteJid;
    console.log(`[Song] Command received: ${m.body} from ${jid}`);

    if (!args[0]) {
      return sock.sendMessage(jid, { text: "❌ দয়া করে গানের নাম বা YouTube URL দিন।\nউদাহরণ: `.song despacito` বা `.song https://www.youtube.com/watch?v=kJQP7kiw5Fk`" }, { quoted: m });
    }

    const query = args.join(" ");
    let attempts = 0;
    const maxAttempts = 3;
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    // Proxy list (comma-separated in env)
    const proxies = process.env.HTTP_PROXY ? process.env.HTTP_PROXY.split(",") : [];
    const getAgent = () => proxies.length ? new ProxyAgent(proxies[Math.floor(Math.random() * proxies.length)]) : null;

    try {
      // Search or validate URL
      let url;
      let title = "Unknown Title";
      let thumbnail = null;
      let agent = getAgent();
      if (ytdl.validateURL(query)) {
        url = query;
        const info = await ytdl.getInfo(url, { agent, requestOptions: { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" } } });
        title = info.videoDetails.title;
        thumbnail = info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url;
      } else {
        console.log(`[Song] Searching for: ${query}`);
        await delay(2000); // Avoid rate limit
        const search = await ytSearch(query);
        if (!search.videos.length) {
          return sock.sendMessage(jid, { text: "❌ কোন ফলাফল পাওয়া যায়নি।" }, { quoted: m });
        }
        url = search.videos[0].url;
        title = search.videos[0].title;
        thumbnail = search.videos[0].thumbnail;
        console.log(`[Song] Selected: ${title} (${url}), Thumbnail: ${thumbnail}`);
      }

      // Notify user
      await sock.sendMessage(jid, { text: `🎶 *${title}* ডাউনলোড হচ্ছে...\n⏳ দয়া করে অপেক্ষা করুন...` }, { quoted: m });

      // Create downloads folder
      const downloadsDir = path.join(__dirname, "../downloads");
      if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true });
        console.log(`[Song] Created downloads directory: ${downloadsDir}`);
      }
      const outFile = path.join(downloadsDir, `${Date.now()}.mp3`);

      while (attempts < maxAttempts) {
        try {
          console.log(`[Song] Attempt ${attempts + 1}: Downloading ${url} with proxy: ${agent ? agent.proxy.href : "none"}`);
          await delay(3000 * Math.pow(2, attempts)); // Exponential backoff: 3s, 6s, 12s
          const stream = ytdl(url, { 
            filter: "audioonly", 
            quality: "highestaudio",
            agent,
            requestOptions: { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" } }
          });
          await new Promise((resolve, reject) => {
            ffmpeg(stream)
              .audioBitrate(128)
              .format("mp3")
              .save(outFile)
              .on("end", resolve)
              .on("error", reject);
          });

          // Verify file
          const stats = fs.statSync(outFile);
          if (!fs.existsSync(outFile) || stats.size === 0) {
            throw new Error("Downloaded audio file is missing or empty.");
          }

          // Check file size (WhatsApp max ~16MB)
          if (stats.size > 16 * 1024 * 1024) {
            throw new Error("Audio file exceeds WhatsApp's 16MB limit.");
          }

          // Download thumbnail
          let thumbnailBuffer = null;
          if (thumbnail) {
            try {
              console.log(`[Song] Downloading thumbnail: ${thumbnail}`);
              const response = await axios.get(thumbnail, { responseType: "arraybuffer", timeout: 10000 });
              thumbnailBuffer = Buffer.from(response.data);
            } catch (err) {
              console.warn(`[Song] Failed to download thumbnail: ${err.message}`);
            }
          }

          // Send audio with thumbnail
          console.log(`[Song] Sending audio: ${outFile}, size: ${stats.size / (1024 * 1024)}MB`);
          await sock.sendMessage(jid, {
            audio: { url: outFile },
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`,
            ...(thumbnailBuffer ? { thumbnail: thumbnailBuffer } : {})
          }, { quoted: m });

          // Clean up
          fs.unlinkSync(outFile);
          console.log(`[Song] Cleaned up: ${outFile}`);
          return; // Success
        } catch (err) {
          console.error(`[Song] Attempt ${attempts + 1} failed: ${err.message}`);
          attempts++;
          if (attempts < maxAttempts) {
            await delay(5000); // Additional delay
            agent = getAgent(); // Rotate proxy
            const search = await ytSearch(query);
            url = search.videos[attempts % search.videos.length].url;
            title = search.videos[attempts % search.videos.length].title;
            thumbnail = search.videos[attempts % search.videos.length].thumbnail;
            console.log(`[Song] Retrying with: ${title} (${url})`);
          } else {
            throw new Error("All download attempts failed. Possibly rate-limited (429).");
          }
        }
      }
    } catch (err) {
      console.error("[Song Error]:", err.stack || err.message);
      await sock.sendMessage(jid, { text: `❌ গান প্রক্রিয়া করতে ব্যর্থ।\nকারণ: ${err.message}\nঅন্য গানের নাম বা URL চেষ্টা করুন অথবা পরে আবার চেষ্টা করুন।` }, { quoted: m });
    }
  }
};
