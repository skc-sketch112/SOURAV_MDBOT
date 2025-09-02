const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "nightcore",
  alias: ["nc"],
  desc: "Convert any audio into Nightcore version (speed + pitch up)",
  category: "audio",
  usage: ".nightcore (reply to audio)",

  async execute(sock, msg, args) {
    try {
      if (!msg.quoted || !msg.quoted.audioMessage) {
        return await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Reply to an audio file to nightcore it!" }, { quoted: msg });
      }

      // Download quoted audio
      const buffer = await msg.quoted.download();
      const inputPath = path.join(__dirname, "input.mp3");
      const outputPath = path.join(__dirname, "nightcore.mp3");

      fs.writeFileSync(inputPath, buffer);

      // 🟢 Use ffmpeg directly (Python no longer needed)
      // Speed up ~1.25x and pitch shift
      const cmd = `ffmpeg -y -i "${inputPath}" -filter_complex "asetrate=44100*1.25,atempo=1.1" "${outputPath}"`;

      exec(cmd, async (err) => {
        if (err) {
          console.error("❌ FFmpeg Nightcore Error:", err);
          return await sock.sendMessage(msg.key.remoteJid, { text: "❌ Nightcore failed." }, { quoted: msg });
        }

        const audio = fs.readFileSync(outputPath);
        await sock.sendMessage(
          msg.key.remoteJid,
          { audio: audio, mimetype: "audio/mp4", ptt: false },
          { quoted: msg }
        );

        // Cleanup
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });
    } catch (e) {
      console.error(e);
      await sock.sendMessage(msg.key.remoteJid, { text: "❌ Error while processing Nightcore." }, { quoted: msg });
    }
  },
};
