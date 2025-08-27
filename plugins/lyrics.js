// lyrics.js
const { getLyrics } = require("genius-lyrics-api");
const axios = require("axios");

module.exports = {
  name: "lyrics",
  command: ["lyrics", "songlyrics"],
  description: "Fetch song lyrics (any language)",

  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;
    try {
      if (!args[0]) return sock.sendMessage(jid, { text: "❌ Usage: .lyrics <song name>" }, { quoted: msg });

      const query = args.join(" ");
      let lyrics = await getLyrics({
        apiKey: process.env.GENIUS_ACCESS_TOKEN,
        title: query,
        optimizeQuery: true,
      });

      if (!lyrics) {
        // fallback: use lyrics.ovh (free)
        const res = await axios.get(`https://api.lyrics.ovh/v1/${query}`);
        lyrics = res.data.lyrics || "❌ Lyrics not found.";
      }

      await sock.sendMessage(jid, { text: `📑 *Lyrics for ${query}*:\n\n${lyrics}` }, { quoted: msg });

    } catch (err) {
      console.error("Lyrics Error:", err);
      await sock.sendMessage(jid, { text: "❌ Failed to fetch lyrics." }, { quoted: msg });
    }
  }
};
