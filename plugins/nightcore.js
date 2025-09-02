const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");

module.exports = {
  name: "nightcore",
  alias: ["nc"],
  desc: "Convert tagged audio into Nightcore (sped up + pitch shift)",
  category: "music",
  usage: ".nightcore (reply to an audio)",

  async execute(sock, msg) {
    try {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const audioMsg = quoted?.audioMessage;

      if (!audioMsg) {
        return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Reply to an audio file to convert." }, { quoted: msg });
      }

      // Download the quoted audio
      const buffer = await sock.downloadMediaMessage({ message: quoted });
      const inputFile = path.join(__dirname, "input.ogg");
      const outputFile = path.join(__dirname, "nightcore.mp3");
      fs.writeFileSync(inputFile, buffer);

      // ✅ Nightcore filter: speed up & pitch shift
      const ffmpegCmd = `ffmpeg -y -i ${inputFile} -filter:a "asetrate=48000*1.25,atempo=1.1" -vn ${outputFile}`;

      exec(ffmpegCmd, async (err) => {
        if (err) {
          console.error("FFmpeg error:", err);
          return sock.sendMessage(msg.key.remoteJid, { text: "❌ Failed to process Nightcore." }, { quoted: msg });
        }

        const audio = fs.readFileSync(outputFile);
        await sock.sendMessage(msg.key.remoteJid, { audio, mimetype: "audio/mpeg" }, { quoted: msg });

        // Cleanup
        fs.unlinkSync(inputFile);
        fs.unlinkSync(outputFile);
      });
    } catch (e) {
      console.error("Nightcore error:", e);
      sock.sendMessage(msg.key.remoteJid, { text: "❌ Error processing Nightcore." }, { quoted: msg });
    }
  },
};
