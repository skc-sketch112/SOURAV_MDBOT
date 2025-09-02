const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");

module.exports = {
  name: "nightcore",
  alias: ["nc"],
  desc: "Apply Nightcore effect (faster + pitched up)",
  category: "music",
  usage: ".nightcore (reply to audio)",

  async execute(sock, msg) {
    try {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const audioMsg = quoted?.audioMessage;

      if (!audioMsg) {
        return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Reply to an audio to convert." }, { quoted: msg });
      }

      // Download quoted audio
      const buffer = await sock.downloadMediaMessage({ message: quoted });
      const inputFile = path.join(__dirname, "input.ogg");
      const outputFile = path.join(__dirname, "nightcore.mp3");
      fs.writeFileSync(inputFile, buffer);

      // ✅ Stable FFmpeg Nightcore filter (works in Render slim)
      const ffmpegCmd = `ffmpeg -y -i "${inputFile}" -af "asetrate=44100*1.25,aresample=44100,atempo=1.1" -vn "${outputFile}"`;

      exec(ffmpegCmd, async (err, stdout, stderr) => {
        if (err) {
          console.error("❌ FFmpeg Nightcore error:", err);
          console.error("⚡ FFmpeg stderr:", stderr);
          return sock.sendMessage(
            msg.key.remoteJid,
            { text: "❌ Nightcore failed.\n\n📜 Debug log:\n" + stderr.slice(0, 4000) },
            { quoted: msg }
          );
        }

        try {
          const audio = fs.readFileSync(outputFile);
          await sock.sendMessage(msg.key.remoteJid, { audio, mimetype: "audio/mpeg" }, { quoted: msg });
        } catch (readErr) {
          console.error("❌ Error reading output:", readErr);
          return sock.sendMessage(msg.key.remoteJid, { text: "❌ Could not read Nightcore output." }, { quoted: msg });
        }

        // cleanup
        try {
          if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);
          if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
        } catch (cleanupErr) {
          console.warn("⚠️ Cleanup failed:", cleanupErr);
        }
      });
    } catch (e) {
      console.error("Nightcore exception:", e);
      sock.sendMessage(msg.key.remoteJid, { text: "❌ Error processing Nightcore (exception)." }, { quoted: msg });
    }
  },
};
