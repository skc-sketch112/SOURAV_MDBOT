const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "song",
  command: ["song", "music"],
  description: "Download music audio (text or link)",

  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    if (!args.length)
      return await sock.sendMessage(jid, { text: "⚠️ Provide a Song link or track name!" }, { quoted: m });

    const query = args.join(" ");
    const tempFile = path.join("/tmp", `${Date.now()}.mp3`);

    try {
      // Notify user
      await sock.sendMessage(jid, { text: `🔄 Downloading from SoundCloud...\n🎵 ${query}` }, { quoted: m });

      // Run yt-dlp
      await new Promise((resolve, reject) => {
        exec(
          `yt-dlp -x --audio-format mp3 -o "${tempFile}" "scsearch1:${query}"`,
          (error, stdout, stderr) => {
            if (error) {
              console.error("yt-dlp error:", stderr || error.message);
              return reject("❌ Failed to download track.");
            }
            resolve(stdout);
          }
        );
      });

      // Check if file exists and not empty
      if (!fs.existsSync(tempFile) || fs.statSync(tempFile).size < 1024 * 50) {
        return await sock.sendMessage(jid, { text: "❌ No valid audio found." }, { quoted: m });
      }

      // Send audio
      await sock.sendMessage(jid, {
        audio: { url: tempFile },
        mimetype: "audio/mpeg",
        ptt: false,
      }, { quoted: m });

      // Cleanup
      fs.unlinkSync(tempFile);
    } catch (err) {
      console.error("SoundCloud plugin error:", err);
      await sock.sendMessage(jid, { text: "❌ Error while processing audio." }, { quoted: m });
    }
  }
};
