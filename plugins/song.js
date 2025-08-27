// song.js - Updated Song Downloader Plugin with YouTube Fixes
const { default: makeWASocket } = require("@whiskeysockets/baileys");
const ytdl = require("ytdl-core");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");
const { pipeline } = require("stream");

module.exports = {
  name: "song",
  command: ["song", "music"],
  description: "Download a song from YouTube by name or URL.",

  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    console.log(`[Song] Command received at ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}: ${m.body} from ${jid}`);

    try {
      if (!args[0]) {
        return sock.sendMessage(jid, { text: "❌ Please provide a song name or YouTube link.\nExample: `.song despacito` or `.song https://youtube.com/..." }, { quoted: m });
      }

      const query = args.join(" ");
      console.log(`[Song] Processing query: ${query}`);

      let url = query;
      if (!ytdl.validateURL(query)) {
        console.log("[Song] Performing YouTube search...");
        const search = await yts(query);
        if (!search.videos || search.videos.length === 0) {
          throw new Error("No results found. Try a different query.");
        }
        url = search.videos[0].url;
      }

      console.log(`[Song] Using URL: ${url}`);
      const info = await ytdl.getInfo(url, {
        requestOptions: {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
          },
        },
      });
      const title = info.videoDetails.title.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
      const audioFormat = ytdl.chooseFormat(info.formats, { quality: "highestaudio" });
      if (!audioFormat) {
        throw new Error("No audio format available.");
      }

      const downloadsDir = path.join(__dirname, "../downloads");
      if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });
      const tempFile = path.join(downloadsDir, `${title}_${Date.now()}.mp3`);
      const stream = ytdl(url, {
        filter: "audioonly",
        quality: "highestaudio",
        highWaterMark: 1 << 25,
        requestOptions: {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        },
      });
      const writer = fs.createWriteStream(tempFile);

      stream.on("progress", (chunkLength, downloaded, total) => {
        const percent = (downloaded / total * 100).toFixed(2);
        console.log(`[Song] Download progress: ${percent}% (${downloaded}/${total} bytes)`);
      });

      stream.on("error", (err) => {
        throw new Error(`Stream error: ${err.message}`);
      });

      await new Promise((resolve, reject) => {
        pipeline(stream, writer, (err) => (err ? reject(err) : resolve()));
      });

      const fileSize = fs.statSync(tempFile).size;
      if (fileSize < 1024 || fileSize > 16 * 1024 * 1024) {
        throw new Error("File too small or exceeds WhatsApp limit (16MB).");
      }

      console.log(`[Song] Saved temp file: ${tempFile}, size: ${fileSize / 1024}KB`);
      await sock.sendMessage(jid, {
        audio: { url: tempFile },
        mimetype: "audio/mpeg",
        ptt: false,
      }, { quoted: m });

      fs.unlinkSync(tempFile);
      console.log(`[Song] Cleaned up: ${tempFile}`);

    } catch (err) {
      console.error("[Song Error]:", err.message, err.stack);
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      await sock.sendMessage(jid, { text: `❌ Failed to download song.\nError: ${err.message}` }, { quoted: m });
    }
  }
}
