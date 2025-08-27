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

  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    let tempFile; // declare outside try for cleanup

    try {
      if (!args[0]) {
        return sock.sendMessage(jid, { text: "❌ Provide a song name or YouTube link.\nExample: `.song despacito`" }, { quoted: m });
      }

      const query = args.join(" ");
      let url = query;

      // If not a YouTube URL, search it
      if (!ytdl.validateURL(query)) {
        const results = await youtubeSearch.GetListByKeyword(query, false, 1);
        if (!results.items || results.items.length === 0) {
          throw new Error("No results found on YouTube.");
        }
        url = `https://www.youtube.com/watch?v=${results.items[0].id}`;
      }

      const info = await ytdl.getInfo(url, { requestOptions: { agent: new https.Agent({ keepAlive: true }) } });
      const title = info.videoDetails.title.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 40);
      const format = ytdl.chooseFormat(info.formats, { quality: "highestaudio" });
      if (!format) throw new Error("No audio format available.");

      // Setup download dir
      const downloadsDir = path.join(__dirname, "../downloads");
      if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });
      tempFile = path.join(downloadsDir, `${title}_${Date.now()}.mp3`);

      const stream = ytdl(url, {
        filter: "audioonly",
        quality: "highestaudio",
        highWaterMark: 1 << 25
      });

      await new Promise((resolve, reject) => {
        pipeline(stream, fs.createWriteStream(tempFile), (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const fileSize = fs.statSync(tempFile).size;
      if (fileSize > 15 * 1024 * 1024) {
        throw new Error("File exceeds WhatsApp 16MB limit. Try a shorter song.");
      }

      await sock.sendMessage(jid, {
        audio: { url: tempFile },
        mimetype: "audio/mpeg",
        ptt: false
      }, { quoted: m });

      fs.unlinkSync(tempFile);

    } catch (err) {
      console.error("[Song Error]:", err.message);
      if (tempFile && fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      await sock.sendMessage(jid, { text: `❌ Failed to download.\nError: ${err.message}` }, { quoted: m });
    }
  }
};
