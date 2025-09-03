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

    const sendText = async (text, key = msg.key) => {
      return sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
    };

    // Send initial message (this will be edited for loader animation)
    const sentMsg = await sock.sendMessage(msg.key.remoteJid, {
      text: `⏳ Fetching video for *${query}* ...`
    });

    // Loader animation frames
    const frames = [
      "⏳ Fetching video for *" + query + "* .",
      "⏳ Fetching video for *" + query + "* ..",
      "⏳ Fetching video for *" + query + "* ...",
      "⏳ Fetching video for *" + query + "* ...."
    ];

    // Animate 4 cycles (16 edits)
    for (let i = 0; i < 16; i++) {
      await new Promise(r => setTimeout(r, 400));
      await sock.sendMessage(msg.key.remoteJid, {
        edit: sentMsg.key,
        text: frames[i % frames.length]
      });
    }

    // Function to download video via yt-dlp
    const downloadVideo = () => {
      return new Promise((resolve, reject) => {
        const cmd = `yt-dlp -f "best[ext=mp4]" -o "${rawFile.replace(/\\/g, "/")}" "ytsearch1:${query}"`;
        exec(cmd, { maxBuffer: 1024 * 1024 * 100 }, (err, stdout, stderr) => {
          if (err) return reject(stderr || err.message);
          resolve(stdout);
        });
      });
    };

    // Function to trim video to 5 min
    const trimVideo = () => {
      return new Promise((resolve, reject) => {
        const cmd = `ffmpeg -y -i "${rawFile.replace(/\\/g, "/")}" -t 300 -c copy "${finalFile.replace(/\\/g, "/")}"`;
        exec(cmd, { maxBuffer: 1024 * 1024 * 100 }, (err, stdout, stderr) => {
          if (err) return reject(stderr || err.message);
          resolve(stdout);
        });
      });
    };

    try {
      await downloadVideo();
    } catch (dlErr) {
      console.error("yt-dlp error:", dlErr);
      return sendText("❌ Failed to fetch video. Try another song.");
    }

    try {
      await trimVideo();
    } catch (trimErr) {
      console.error("ffmpeg trim error:", trimErr);
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
      // Clean up temp files
      try { fs.unlinkSync(rawFile); } catch {}
      try { fs.unlinkSync(finalFile); } catch {}
    }
  },
};
