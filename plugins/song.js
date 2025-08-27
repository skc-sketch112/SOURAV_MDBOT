const fs = require("fs");
const path = require("path");
const ytdl = require("ytdl-core");
const yts = require("yt-search");
const { MessageMedia } = require("whatsapp-web.js");
const ffmpeg = require("fluent-ffmpeg");

module.exports = {
  name: "song",
  command: ["song", "playsong", "play"],
  description: "Search and send songs from YouTube",

  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;
    const query = args.join(" ");

    if (!query) {
      return sock.sendMessage(jid, { text: "❌ Please provide a song name after the command." }, { quoted: msg });
    }

    try {
      // Search YouTube for song
      const searchResult = await yts(query);
      if (!searchResult.videos.length) {
        return sock.sendMessage(jid, { text: "❌ No results found for your query." }, { quoted: msg });
      }

      const video = searchResult.videos[0];
      const url = video.url;

      // Stream audio from YouTube
      const stream = ytdl(url, { filter: "audioonly", quality: "highestaudio" });

      // Temporary file path to save mp3
      const tempFilePath = path.join(__dirname, `../downloads/song_${Date.now()}.mp3`);

      // Convert stream to mp3
      await new Promise((resolve, reject) => {
        ffmpeg(stream)
          .audioBitrate(128)
          .format("mp3")
          .save(tempFilePath)
          .on("end", resolve)
          .on("error", reject);
      });

      // Read mp3 and send as WhatsApp media
      const media = MessageMedia.fromFilePath(tempFilePath);
      const caption = `🎵 *${video.title}*
📺 ${video.url}

Requested by: @${msg.key.participant?.split("@")[0] || jid.split("@")[0]}`;
      await sock.sendMessage(jid, media, { caption, quoted: msg, mentions: [msg.key.participant] });

      // Cleanup temp file
      fs.unlinkSync(tempFilePath);

    } catch (error) {
      console.error("Song Plugin Error:", error);
      await sock.sendMessage(jid, { text: "❌ Failed to fetch or send the song. Please try again later." }, { quoted: msg });
    }
  },
};
