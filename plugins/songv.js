const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const Saavn = require("jio-saavn");
const ytdl = require("ytdl-core"); // optional for direct YouTube downloads if needed

module.exports = {
  name: "songv",
  alias: ["sv", "video", "ytv"],
  desc: "Download song video/audio (MP4/MP3) with multi-source fallback",
  category: "media",
  usage: ".songv <song name>",

  async execute(sock, msg, args) {
    if (!args.length)
      return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Usage: `.songv <song name>`" }, { quoted: msg });

    const query = args.join(" ");
    const rawFile = path.join(__dirname, "raw_songv.mp4");
    const finalFile = path.join(__dirname, "songv_trimmed.mp4");

    const sendText = async (text) => sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });

    // Loader animation
    const sentMsg = await sendText(`⏳ Fetching video for *${query}* ...`);
    const frames = ["⏳ Fetching .", "⏳ Fetching ..", "⏳ Fetching ...", "⏳ Fetching ...."];
    let frameIndex = 0;
    const loaderInterval = setInterval(async () => {
      frameIndex = (frameIndex + 1) % frames.length;
      await sock.sendMessage(msg.key.remoteJid, { edit: sentMsg.key, text: frames[frameIndex] });
    }, 400);

    // Helper: trim videos
    const trimVideo = () =>
      new Promise((resolve, reject) => {
        const cmdDuration = `ffprobe -v error -select_streams v:0 -show_entries stream=duration -of csv=p=0 "${rawFile.replace(/\\/g, "/")}"`;
        exec(cmdDuration, (err, stdout) => {
          if (err) return reject(err);
          const duration = parseFloat(stdout);
          if (isNaN(duration)) return reject("Could not get duration");
          if (duration > 300) {
            const cmdTrim = `ffmpeg -y -i "${rawFile.replace(/\\/g, "/")}" -t 300 -c copy "${finalFile.replace(/\\/g, "/")}"`;
            exec(cmdTrim, { maxBuffer: 1024 * 1024 * 300 }, (err2) => (err2 ? reject(err2) : resolve()));
          } else {
            fs.copyFileSync(rawFile, finalFile);
            resolve();
          }
        });
      });

    // Try multiple YouTube search results
    const tryYouTube = async () => {
      for (let i = 0; i < 3; i++) {
        try {
          const cmd = `yt-dlp --geo-bypass --no-check-certificate -f "best[ext=mp4]" -o "${rawFile.replace(/\\/g, "/")}" "ytsearch${i + 1}:${query}"`;
          await new Promise((resolve, reject) => exec(cmd, { maxBuffer: 1024 * 1024 * 300 }, (err) => (err ? reject(err) : resolve())));
          await trimVideo();
          return true;
        } catch {}
      }
      return false;
    };

    // Fallback: Saavn
    const fetchSaavn = async () => {
      const results = await Saavn.search(query);
      if (!results || !results[0]) throw new Error("No Saavn results");
      const songUrl = results[0].media_url;
      const cmd = `yt-dlp -f best -o "${rawFile.replace(/\\/g, "/")}" "${songUrl}"`;
      await new Promise((resolve, reject) => exec(cmd, { maxBuffer: 1024 * 1024 * 300 }, (err) => (err ? reject(err) : resolve())));
      await trimVideo();
    };

    // Fallback: add Spotify or SoundCloud if desired
    const fetchSpotifyOrSC = async () => {
      // Placeholder for future integration
      throw new Error("Spotify/SoundCloud fallback not yet implemented");
    };

    try {
      const ytSuccess = await tryYouTube();
      if (!ytSuccess) {
        await sendText("⚠️ YouTube failed, trying Saavn...");
        await fetchSaavn();
      }
    } catch (err) {
      console.error(err);
      clearInterval(loaderInterval);
      return sendText("❌ Failed to fetch video from all sources.");
    }

    clearInterval(loaderInterval);

    try {
      const video = fs.readFileSync(finalFile);
      await sock.sendMessage(msg.key.remoteJid, {
        edit: sentMsg.key,
        video,
        mimetype: "video/mp4",
        caption: `🎬 Video fetched: *${query}* (max 5 min)`
      });
    } catch (err) {
      console.error("Send error:", err);
      await sendText("❌ Error sending video.");
    } finally {
      [rawFile, finalFile].forEach((f) => {
        try {
          if (fs.existsSync(f)) fs.unlinkSync(f);
        } catch {}
      });
    }
  }
};
