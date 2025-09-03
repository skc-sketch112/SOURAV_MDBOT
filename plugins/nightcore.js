const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { exec } = require("child_process");
const scdl = require("soundcloud-downloader").default;
const ytdlp = require("yt-dlp-exec"); // Make sure yt-dlp is installed in Docker

module.exports = {
  name: "nightcore",
  alias: ["nc", "night"],
  desc: "Convert any song from SoundCloud or YouTube into Nightcore",
  category: "music",
  usage: ".nightcore <song_name_or_link>",
  async execute(sock, msg, args) {
    if (!args[0]) return sock.sendMessage(msg.key.remoteJid, { text: "🎵 Give me a song name or link!" }, { quoted: msg });

    const query = args.join(" ");
    const tempDir = path.join(__dirname, "../temp");

    // Ensure temp folder exists
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const tempFile = path.join(tempDir, `${Date.now()}.mp3`);
    const ncFile = path.join(tempDir, `${Date.now()}_nightcore.mp3`);

    try {
      // Send initial message for loader animation
      const sentMsg = await sock.sendMessage(msg.key.remoteJid, {
        text: `🎵 Processing Nightcore for *${query}* ...`
      });

      // Loader animation
      const frames = ["⏳ Processing .", "⏳ Processing ..", "⏳ Processing ...", "⏳ Processing ...."];
      for (let i = 0; i < 12; i++) { // 3 full cycles
        await new Promise(r => setTimeout(r, 400));
        await sock.sendMessage(msg.key.remoteJid, { edit: sentMsg.key, text: frames[i % frames.length] });
      }

      let audioUrl;

      // 🔹 SoundCloud link
      if (query.includes("soundcloud.com")) {
        audioUrl = await scdl.getDownloadURL(query);
      } else {
        // 🔹 YouTube search and download using yt-dlp
        const ytResult = await ytdlp(`ytsearch1:${query}`, {
          dumpSingleJson: true,
          format: "bestaudio/best",
        });

        if (!ytResult || !ytResult.url) return sock.sendMessage(msg.key.remoteJid, { text: "❌ Could not find YouTube audio!" }, { quoted: msg });

        audioUrl = ytResult.url;
      }

      // Download audio
      const { data } = await axios.get(audioUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(tempFile, data);

      // Apply Nightcore effect
      await new Promise((resolve, reject) => {
        const cmd = `ffmpeg -y -i "${tempFile}" -filter:a "asetrate=44100*1.25,aresample=44100" "${ncFile}"`;
        exec(cmd, { maxBuffer: 1024 * 1024 * 50 }, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Send Nightcore audio in the same message
      await sock.sendMessage(msg.key.remoteJid, {
        edit: sentMsg.key,
        audio: fs.readFileSync(ncFile),
        mimetype: "audio/mpeg",
        fileName: `Nightcore-${query}.mp3`,
      });

    } catch (err) {
      console.error("Nightcore Error:", err);
      await sock.sendMessage(msg.key.remoteJid, { edit: msg.key, text: "⚠️ Error processing Nightcore track!" });
    } finally {
      // Cleanup temp files
      try { fs.unlinkSync(tempFile); } catch {}
      try { fs.unlinkSync(ncFile); } catch {}
    }
  }
};
