const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const ytdlp = require("yt-dlp-exec"); // Make sure yt-dlp-exec is installed

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

    const sendText = async (text) => {
      return sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
    };

    // Send initial fetching message
    const sentMsg = await sock.sendMessage(msg.key.remoteJid, {
      text: `⏳ Fetching video for *${query}* ...`
    });

    try {
      // Download the first search result from YouTube
      await ytdlp(`ytsearch1:${query}`, {
        format: "best[ext=mp4]",
        output: rawFile,
      });
    } catch (err) {
      console.error("yt-dlp download error:", err);
      return sendText("❌ Failed to fetch video. Try another song.");
    }

    // Trim video to 5 minutes
    try {
      await new Promise((resolve, reject) => {
        const cmd = `ffmpeg -y -i "${rawFile}" -t 300 -c copy "${finalFile}"`;
        exec(cmd, { maxBuffer: 1024 * 1024 * 100 }, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    } catch (err) {
      console.error("ffmpeg trim error:", err);
      return sendText("❌ Error trimming video.");
    }

    // Send trimmed video
    try {
      const video = fs.readFileSync(finalFile);
      await sock.sendMessage(msg.key.remoteJid, {
        edit: sentMsg.key,
        video,
        mimetype: "video/mp4",
        caption: `🎬 Video fetched: *${query}* (max 5 min)`,
      });
    } catch (err) {
      console.error("Error sending video:", err);
      return sendText("❌ Error sending video.");
    } finally {
      // Clean up temp files
      try { fs.unlinkSync(rawFile); } catch {}
      try { fs.unlinkSync(finalFile); } catch {}
    }
  },
};
