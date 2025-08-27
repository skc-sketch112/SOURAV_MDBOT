// shazam.js
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { getLyrics } = require("genius-lyrics-api");

module.exports = {
  name: "shazam",
  command: ["shazam", "findsong"],
  description: "Identify songs + fetch lyrics (Ultra Power)",

  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;
    try {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted || !quoted.audioMessage) {
        return sock.sendMessage(jid, { text: "🎵 Reply to an *audio/voice note* to identify the song!" }, { quoted: msg });
      }

      // Download audio
      const buffer = await sock.downloadMediaMessage({ message: quoted });
      if (!buffer) throw new Error("Failed to download audio!");

      const filePath = path.join(__dirname, `../downloads/shazam_${Date.now()}.mp3`);
      fs.writeFileSync(filePath, buffer);

      // Use Audd.io for recognition
      const formData = new FormData();
      formData.append("file", fs.createReadStream(filePath));
      formData.append("api_token", process.env.AUDD_API_KEY);

      const res = await axios.post("https://api.audd.io/", formData, {
        headers: formData.getHeaders(),
      });

      fs.unlinkSync(filePath);

      if (!res.data.result) {
        return sock.sendMessage(jid, { text: "❌ Could not recognize the song." }, { quoted: msg });
      }

      const { title, artist } = res.data.result;
      let reply = `🎶 *${title}* - ${artist}\n\n`;

      // Genius Lyrics
      const lyrics = await getLyrics({
        apiKey: process.env.GENIUS_ACCESS_TOKEN,
        title,
        artist,
        optimizeQuery: true,
      });

      reply += lyrics ? `📑 Lyrics:\n\n${lyrics}` : "❌ Lyrics not found.";
      await sock.sendMessage(jid, { text: reply }, { quoted: msg });

    } catch (err) {
      console.error("Shazam Error:", err);
      await sock.sendMessage(jid, { text: "❌ Failed to identify song." }, { quoted: msg });
    }
  }
};
