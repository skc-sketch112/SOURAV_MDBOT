// lyrics.js - Ultra Powerful Lyrics Plugin
const { getLyrics } = require("genius-lyrics-api");
const axios = require("axios");

module.exports = {
  name: "lyrics",
  command: ["lyrics", "songlyrics"],
  description: "Fetch unlimited lyrics for any song (Hindi, Bengali, English, etc.)",

  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;

    try {
      if (!args[0]) {
        return sock.sendMessage(jid, { 
          text: "❌ Usage: .lyrics <song name>\nExample: .lyrics Tum Hi Ho" 
        }, { quoted: msg });
      }

      const query = args.join(" ");
      let finalLyrics = null;

      // 1️⃣ Try Genius API
      try {
        const options = {
          apiKey: process.env.GENIUS_ACCESS_TOKEN || "",
          title: query,
          artist: "",
          optimizeQuery: true
        };
        finalLyrics = await getLyrics(options);
      } catch (err) {
        console.log("[Lyrics] Genius failed:", err.message);
      }

      // 2️⃣ Fallback to Free API (lyrics.ovh)
      if (!finalLyrics) {
        try {
          const res = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(query)}`);
          finalLyrics = res.data.lyrics || null;
        } catch (err) {
          console.log("[Lyrics] lyrics.ovh failed:", err.message);
        }
      }

      // 3️⃣ If still no lyrics
      if (!finalLyrics) {
        return sock.sendMessage(jid, { text: `❌ Could not fetch lyrics for *${query}*.` }, { quoted: msg });
      }

      // ✅ Send Lyrics
      await sock.sendMessage(jid, {
        text: `🎶 *Lyrics for:* ${query}\n\n${finalLyrics.substring(0, 4000)}`
      }, { quoted: msg });

    } catch (err) {
      console.error("[Lyrics Error]:", err);
      await sock.sendMessage(jid, { text: "❌ Failed to fetch lyrics. Try again later." }, { quoted: msg });
    }
  }
};
