const play = require("play-dl");
const fs = require("fs");
const path = require("path");
const { pipeline } = require("stream");

module.exports = {
  name: "song",
  command: ["song", "music"],
  description: "Download a song from YouTube by name or URL.",

  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    let tempFile;

    try {
      if (!args[0]) {
        return sock.sendMessage(
          jid,
          { text: "❌ Provide a song name or YouTube link.\nExample: `.song despacito`" },
          { quoted: m }
        );
      }

      const query = args.join(" ");
      let url = query;

      // If not a valid YouTube link, search
      if (!play.yt_validate(query)) {
        const search = await play.search(query, { limit: 1 });
        if (!search.length) throw new Error("No song found on YouTube.");
        url = search[0].url;
      }

      // Get video info
      const ytInfo = await play.video_info(url);
      const title = ytInfo.video_details.title.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 40);

      // Download directory
      const downloadsDir = path.join(__dirname, "../downloads");
      if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });
      tempFile = path.join(downloadsDir, `${title}_${Date.now()}.mp3`);

      // Get audio stream
      const stream = await play.stream_from_info(ytInfo, { quality: 2 }); // quality: 2 = best audio
      const writer = fs.createWriteStream(tempFile);

      await new Promise((resolve, reject) => {
        pipeline(stream.stream, writer, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const fileSize = fs.statSync(tempFile).size;
      if (fileSize > 15 * 1024 * 1024) {
        throw new Error("File exceeds WhatsApp 16MB limit. Try a shorter song.");
      }

      // Send song to WhatsApp
      await sock.sendMessage(
        jid,
        {
          audio: { url: tempFile },
          mimetype: "audio/mpeg",
          ptt: false
        },
        { quoted: m }
      );

      // Clean up
      fs.unlinkSync(tempFile);

    } catch (err) {
      console.error("[Song Error]:", err.message);
      if (tempFile && fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      await sock.sendMessage(
        jid,
        { text: `❌ Failed to download.\nError: ${err.message}` },
        { quoted: m }
      );
    }
  }
};
