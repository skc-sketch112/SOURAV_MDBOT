// song.js - Ultra Pro YouTube Audio Downloader Plugin
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
  description: "Download and send high-quality MP3 audio from YouTube with thumbnail, proxy support, and error handling.",

  async execute(sock, m, args, { axios, fetch }) {
    const jid = m.key.remoteJid;
    console.log(`[Song] Command received: ${m.body} from ${jid}`);

    if (!args[0]) {
      return sock.sendMessage(jid, { text: "❌ Please provide a song name or YouTube URL.\nExample: `.song despacito` or `.song https://www.youtube.com/watch?v=kJQP7kiw5Fk`" }, { quoted: m });
    }

    const query = args.join(" ");
    let attempts = 0;
    const maxAttempts = 5;
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    // Proxy list (comma-separated in env, e.g., "http://proxy1:port,http://proxy2:port")
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
        await delay(2000); // Avoid rate limit on search
        const search = await ytSearch(query);
        if (!search.videos.length) {
          return sock.sendMessage(jid, { text: "❌ No results found." }, { quoted: m });
        }
        url = search.videos[0].url;
        title = search.videos[0].title;
        thumbnail = search.videos[0].thumbnail;
        console.log(`[Song] Selected: ${title} (${url}), Thumbnail: ${thumbnail}`);
      }

      // Notify user
      await sock.sendMessage(jid, { text: `🎶 *${title}* downloading...\n⏳ Please wait...` }, { quoted: m });

      // Create downloads folder
      const downloadsDir = path.join(__dirname, "../downloads");
      if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });
      const outFile = path.join(downloadsDir, `${Date.now()}.mp3`);

      while (attempts < maxAttempts) {
        try {
          console.log(`[Song] Attempt ${attempts + 1}: Downloading ${url} with proxy: ${agent ? agent.proxy.href : "none"}`);
          await delay(3000 * Math.pow(2, attempts)); // Exponential backoff: 3s, 6s, 12s, 24s, 48s
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
          if (!fs.existsSync(outFile) || fs.statSync(outFile).size === 0) {
            throw new Error("Downloaded audio file is missing or empty.");
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
      console.error("[Song Error]:", err.message);
      await sock.sendMessage(jid, { text: `❌ Failed to process song.\nError: ${err.message}\nTry another song name or URL or try later." }, { quoted: m });
    }
  }
};
