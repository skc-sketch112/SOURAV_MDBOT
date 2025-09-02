const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "nightcore",
  alias: ["nc", "night"],
  desc: "Transform song into Nightcore (pitched & speeded up)",
  category: "media",
  usage: ".nightcore <song name>",

  async execute(sock, msg, args) {
    try {
      if (!args.length) {
        return sock.sendMessage(
          msg.key.remoteJid,
          { text: "⚠️ Usage: `.nightcore <song name>`" },
          { quoted: msg }
        );
      }

      const query = args.join(" ");
      const rawFile = path.join(__dirname, "raw_song.mp3");
      const nightcoreFile = path.join(__dirname, "nightcore.mp3");

      await sock.sendMessage(
        msg.key.remoteJid,
        { text: `⏳ Fetching & transforming *${query}* to Nightcore...` },
        { quoted: msg }
      );

      // Step 1: Download audio
      const dlCmd = `yt-dlp -x --audio-format mp3 -o "${rawFile}" "ytsearch1:${query}"`;

      exec(dlCmd, (dlErr, stdout, stderr) => {
        if (dlErr) {
          console.error("yt-dlp error:", stderr);
          return sock.sendMessage(
            msg.key.remoteJid,
            { text: "❌ Failed to fetch song." },
            { quoted: msg }
          );
        }

        // Step 2: Apply Nightcore effect (speed + pitch)
        // atempo: 1.25 => 25% faster, asetrate => higher pitch
        const ffmpegCmd = `ffmpeg -y -i "${rawFile}" -filter:a "asetrate=48000*1.25,atempo=1.25" "${nightcoreFile}"`;

        exec(ffmpegCmd, async (ffErr, ffStdout, ffStderr) => {
          if (ffErr) {
            console.error("ffmpeg error:", ffStderr);
            return sock.sendMessage(
              msg.key.remoteJid,
              { text: "❌ Error processing Nightcore." },
              { quoted: msg }
            );
          }

          try {
            const audio = fs.readFileSync(nightcoreFile);
            await sock.sendMessage(
              msg.key.remoteJid,
              {
                audio,
                mimetype: "audio/mpeg",
                ptt: false,
                fileName: `nightcore-${query}.mp3`,
              },
              { quoted: msg }
            );

            fs.unlinkSync(rawFile);
            fs.unlinkSync(nightcoreFile);
          } catch (err) {
            console.error("File send error:", err);
            sock.sendMessage(
              msg.key.remoteJid,
              { text: "❌ Error sending Nightcore file." },
              { quoted: msg }
            );
          }
        });
      });
    } catch (e) {
      console.error("Nightcore crashed:", e);
      sock.sendMessage(
        msg.key.remoteJid,
        { text: "❌ Nightcore crashed: " + e.message },
        { quoted: msg }
      );
    }
  },
};
