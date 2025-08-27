// song.js - Ultra Pro Song Downloader Plugin with Enhanced Reliability
const { default: makeWASocket } = require("@whiskeysockets/baileys");
const ytdl = require("ytdl-core");
const youtubeSearch = require("youtube-search-api");
const fs = require("fs");
const path = require("path");
const { pipeline } = require("stream");
const https = require("https");

module.exports = {
  name: "song",
  command: ["song", "music"],
  description: "Download a song from YouTube by name or URL.",

  async execute(sock, m, args, { axios, fetch }) {
    const jid = m.key.remoteJid;
    console.log(`[Song] Command received at 02:11 PM IST, Aug 27, 2025: ${m.body} from ${jid}`);

    try {
      if (!args[0]) {
        return sock.sendMessage(jid, { text: "❌ Please provide a song name or URL.\nExample: `.song despacito` or `.song https://youtube.com/..." }, { quoted: m });
      }

      const query = args.join(" ");
      console.log(`[Song] Processing query: ${query}`);

      // Check network connectivity
      const testUrl = "https://www.google.com";
      await axios.get(testUrl, { timeout: 5000 }).catch(() => {
        throw new Error("Network connection failed. Check your internet or proxy.");
      });

      // Determine if input is a URL or search query
      let url = query;
      if (!ytdl.validateURL(query)) {
        console.log("[Song] Performing YouTube search...");
        const searchResults = await youtubeSearch.GetListByKeyword(query, false, 1, { key: process.env.YOUTUBE_API_KEY || null });
        if (!searchResults.items || searchResults.items.length === 0) {
          throw new Error("No song found. Try a different query or check API key.");
        }
        url = `https://www.youtube.com/watch?v=${searchResults.items[0].id}`;
      }

      console.log(`[Song] Using URL: ${url}`);
      const info = await ytdl.getInfo(url, { requestOptions: { agent: new https.Agent({ keepAlive: true }) } });
      const title = info.videoDetails.title.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50); // Limit title length
      const audioFormat = ytdl.chooseFormat(info.formats, { quality: "highestaudio" });
      if (!audioFormat) {
        throw new Error("No audio format available.");
      }

      // Set up proxy if needed (e.g., for Render)
      const requestOptions = process.env.HTTP_PROXY
        ? { agent: new https.Agent({ proxy: process.env.HTTP_PROXY }) }
        : { agent: new https.Agent({ keepAlive: true }) };

      // Download audio with progress and timeout
      const downloadsDir = path.join(__dirname, "../downloads");
      if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });
      const tempFile = path.join(downloadsDir, `${title}_${Date.now()}.mp3`);
      const stream = ytdl(url, {
        filter: "audioonly",
        highWaterMark: 1 << 25, // 32MB buffer
        requestOptions,
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
        const timeout = setTimeout(() => reject(new Error("Download timeout after 30 seconds")), 30000);
        pipeline(stream, writer, (err) => {
          clearTimeout(timeout);
          if (err) reject(err);
          else resolve();
        });
      });

      const fileSize = fs.statSync(tempFile).size;
      if (fileSize < 1024) { // Minimum 1KB check
        throw new Error("Download incomplete or file too small.");
      }
      console.log(`[Song] Saved temp file: ${tempFile}, size: ${fileSize / 1024}KB`);

      // Send audio with WhatsApp limits (max ~16MB)
      if (fileSize > 16 * 1024 * 1024) {
        throw new Error("File size exceeds WhatsApp limit (16MB). Try a shorter song.");
      }

      await sock.sendMessage(jid, {
        audio: { url: tempFile },
        mimetype: "audio/mpeg",
        ptt: false,
      }, { quoted: m });

      // Clean up
      fs.unlinkSync(tempFile);
      console.log(`[Song] Cleaned up: ${tempFile}`);

    } catch (err) {
      console.error("[Song Error]:", err.message, err.stack);
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile); // Clean up on error
      await sock.sendMessage(jid, { text: `❌ Failed to download song.\nError: ${err.message}\nPlease check logs or try again.` }, { quoted: m });
    }
  }
};
