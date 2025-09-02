const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "songv",
  alias: ["sv", "video", "ytv"],
  desc: "Download song video (MP4, max 5 min safe)",
  category: "media",
  usage: ".songv <song name>",

  async execute(sock, msg, args) {
    try {
      if (!args.length) {
        return sock.sendMessage(
          msg.key.remoteJid,
          { text: "⚠️ Usage: `.songv <song name>`" },
          { quoted: msg }
        );
      }

      const query = args.join(" ");
      const rawFile = path.join(__dirname, "raw_songv.mp4");
      const finalFile = path.join(__dirname, "songv_trimmed.mp4");

      // ✅ Step 1: Download MP4 (best available)
      const cmd = `yt-dlp -f "best[ext=mp4]" -o "${rawFile}" "ytsearch1:${query}"`;

      await sock.sendMessage(
        msg.key.remoteJid,
        { text: `⏳ Fetching video for *${query}* ...` },
        { quoted: msg }
      );

      exec(cmd, async (err, stdout, stderr) => {
        if (err) {
          console.error("yt-dlp error:", stderr);
          return sock.sendMessage(
            msg.key.remoteJid,
            { text: "❌ Failed to get video. Try another song." },
            { quoted: msg }
          );
        }

        // ✅ Step 2: Trim to max 5 min (safe for WhatsApp)
        const trimCmd = `ffmpeg -y -i "${rawFile}" -t 300 -c copy "${finalFile}"`;

        exec(trimCmd, async (trimErr) => {
          if (trimErr) {
            console.error("ffmpeg trim error:", trimErr);
            return sock.sendMessage(
              msg.key.remoteJid,
              { text: "❌ Error trimming video." },
              { quoted: msg }
            );
          }

          try {
            const video = fs.readFileSync(finalFile);

            await sock.sendMessage(
              msg.key.remoteJid,
              {
                video,
                mimetype: "video/mp4",
                caption: `🎬 Video fetched: *${query}* (max 5 min)`,
              },
              { quoted: msg }
            );

            fs.unlinkSync(rawFile);
            fs.unlinkSync(finalFile);
          } catch (fileErr) {
            console.error("File send error:", fileErr);
            return sock.sendMessage(
              msg.key.remoteJid,
              { text: "❌ Error sending video." },
              { quoted: msg }
            );
          }
        });
      });
    } catch (e) {
      console.error("songv crashed:", e);
      sock.sendMessage(
        msg.key.remoteJid,
        { text: "❌ songv crashed: " + e.message },
        { quoted: msg }
      );
    }
  },
};
