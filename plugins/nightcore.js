const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const ytdlp = require("yt-dlp-exec");
const scdl = require("soundcloud-downloader").default;
const axios = require("axios");
const { JioSaavn } = require("jiosaavn");

const saavn = new JioSaavn();

module.exports = {
  name: "nightcore",
  alias: ["nc", "night"],
  desc: "Convert any song from SoundCloud or JioSaavn into Nightcore",
  category: "music",
  usage: ".nightcore song_name",
  async execute(sock, msg, args) {
    if (!args[0]) return msg.reply("🎵 Give me a song name or SoundCloud link!");

    const query = args.join(" ");
    const tempFile = path.join(__dirname, `../temp/${Date.now()}.mp3`);
    const ncFile = path.join(__dirname, `../temp/${Date.now()}_nightcore.mp3`);

    try {
      let audioUrl;

      // 🔹 Check if it's a SoundCloud link
      if (query.includes("soundcloud.com")) {
        audioUrl = await scdl.getDownloadURL(query);
      } else {
        // 🔹 Otherwise fetch from JioSaavn
        const res = await saavn.search(query);
        if (!res.data[0]) return msg.reply("❌ Song not found on JioSaavn!");
        const song = await saavn.getSong(res.data[0].id);
        audioUrl = song.downloadUrl.pop().link;
      }

      // Download original song
      const { data } = await axios.get(audioUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(tempFile, data);

      // Apply Nightcore effect (speed up + pitch shift)
      await new Promise((resolve, reject) => {
        exec(
          `ffmpeg -i "${tempFile}" -filter:a "asetrate=44100*1.25,aresample=44100" "${ncFile}" -y`,
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      // Send back Nightcore version
      await sock.sendMessage(msg.key.remoteJid, {
        audio: fs.readFileSync(ncFile),
        mimetype: "audio/mpeg",
        fileName: `Nightcore-${query}.mp3`,
      }, { quoted: msg });

      // Cleanup
      fs.unlinkSync(tempFile);
      fs.unlinkSync(ncFile);

    } catch (err) {
      console.error(err);
      msg.reply("⚠️ Error processing Nightcore track!");
    }
  }
};
