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

    const sendText = async (text) => sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });

    const sentMsg = await sendText(`⏳ Fetching video for *${query}* ...`);

    // Loader animation
    const frames = [
      `⏳ Fetching video for *${query}* .`,
      `⏳ Fetching video for *${query}* ..`,
      `⏳ Fetching video for *${query}* ...`,
      `⏳ Fetching video for *${query}* ....`
    ];
    for (let i = 0; i < 12; i++) {
      await new Promise(r => setTimeout(r, 400));
      await sock.sendMessage(msg.key.remoteJid, { edit: sentMsg.key, text: frames[i % frames.length] });
    }

    // Download video function with geo-bypass and safe options
    const downloadVideo = () => new Promise((resolve, reject) => {
      const cmd = `yt-dlp --geo-bypass --no-check-certificate -f "best[ext=mp4]" -o "${rawFile.replace(/\\/g, "/")}" "ytsearch1:${query}"`;
      exec(cmd, { maxBuffer: 1024 * 1024 * 300 }, (err, stdout, stderr) => {
        if (err) return reject(stderr || err.message);
        resolve(stdout);
      });
    });

    // Trim if over 5 minutes
    const trimIfNeeded = () => new Promise((resolve, reject) => {
      const cmdDuration = `ffprobe -v error -select_streams v:0 -show_entries stream=duration -of csv=p=0 "${rawFile.replace(/\\/g, "/")}"`;
      exec(cmdDuration, (err, stdout) => {
        if (err) return reject(err.message);
        const duration = parseFloat(stdout);
        if (isNaN(duration)) return reject("Could not get video duration");

        if (duration > 300) {
          const cmdTrim = `ffmpeg -y -i "${rawFile.replace(/\\/g, "/")}" -t 300 -c copy "${finalFile.replace(/\\/g, "/")}"`;
          exec(cmdTrim, { maxBuffer: 1024 * 1024 * 300 }, (err2) => {
            if (err2) return reject(err2.message);
            resolve();
          });
        } else {
          fs.copyFileSync(rawFile, finalFile);
          resolve();
        }
      });
    });

    try {
      await downloadVideo();
    } catch (dlErr) {
      console.error("yt-dlp error:", dlErr);
      return sendText("❌ Failed to fetch video. Check network or yt-dlp installation.");
    }

    try {
      await trimIfNeeded();
    } catch (trimErr) {
      console.error("Video processing error:", trimErr);
      return sendText("❌ Error trimming video.");
    }

    try {
      const video = fs.readFileSync(finalFile);
      await sock.sendMessage(msg.key.remoteJid, {
        edit: sentMsg.key,
        video,
        mimetype: "video/mp4",
        caption: `🎬 Video fetched: *${query}* (max 5 min)`
      });
    } catch (fileErr) {
      console.error("File send error:", fileErr);
      return sendText("❌ Error sending video.");
    } finally {
      [rawFile, finalFile].forEach(file => {
        try { if (fs.existsSync(file)) fs.unlinkSync(file); } catch {}
      });
    }
  },
};
