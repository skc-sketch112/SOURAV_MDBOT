const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const FormData = require("form-data");
const shazam = require("node-shazam"); // fallback library

module.exports = {
  name: "shazam",
  command: ["shazam", "findsong", "whatmusic"],
  description: "Identify any song by audio (like Shazam) - unlimited with fallback.",

  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;

    try {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const audioMsg = msg.message?.audioMessage || quoted?.audioMessage;

      if (!audioMsg) {
        return sock.sendMessage(jid, {
          text: "🎵 Reply to a *song/voice note/audio* with `.shazam` to identify the track."
        }, { quoted: msg });
      }

      // Download audio
      const buffer = await sock.downloadMediaMessage(msg, "buffer");
      if (!buffer) throw new Error("Failed to download audio.");

      const downloadsDir = path.join(__dirname, "../downloads");
      if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });
      const tempFile = path.join(downloadsDir, `shazam_${Date.now()}.mp3`);
      fs.writeFileSync(tempFile, buffer);

      let reply;

      // -------------------------
      // 1. Try AUDD.io API
      // -------------------------
      try {
        const apiKey = process.env.AUDD_API_KEY;
        if (!apiKey) throw new Error("Missing Audd.io API key.");

        const formData = new FormData();
        formData.append("api_token", apiKey);
        formData.append("return", "apple_music,spotify,deezer");
        formData.append("file", fs.createReadStream(tempFile));

        const res = await fetch("https://api.audd.io/", { method: "POST", body: formData });
        const data = await res.json();

        if (data?.result) {
          const song = data.result;
          reply = `✅ *Song Found (AUDD.io)*\n\n🎶 Title: ${song.title}\n🎤 Artist: ${song.artist}`;
          if (song.album) reply += `\n💿 Album: ${song.album}`;
          if (song.release_date) reply += `\n📅 Released: ${song.release_date}`;
          if (song.spotify?.external_urls?.spotify) reply += `\n🔗 Spotify: ${song.spotify.external_urls.spotify}`;
          if (song.apple_music?.url) reply += `\n🍏 Apple Music: ${song.apple_music.url}`;
          if (song.deezer?.link) reply += `\n🎵 Deezer: ${song.deezer.link}`;
        } else {
          throw new Error("AUDD.io could not recognize.");
        }
      } catch (err) {
        console.warn("[Shazam] AUDD.io failed:", err.message);
      }

      // -------------------------
      // 2. Fallback: node-shazam
      // -------------------------
      if (!reply) {
        try {
          const song = await shazam(tempFile);
          if (song?.track) {
            reply = `✅ *Song Found (Shazam)*\n\n🎶 Title: ${song.track.title}\n🎤 Artist: ${song.track.subtitle}`;
            if (song.track.url) reply += `\n🔗 Link: ${song.track.url}`;
          } else {
            throw new Error("No match from Shazam fallback.");
          }
        } catch (err) {
          console.warn("[Shazam] Fallback failed:", err.message);
        }
      }

      // Final result
      if (!reply) {
        reply = "❌ Sorry, I could not recognize this song. Try a clearer audio clip.";
      }

      await sock.sendMessage(jid, { text: reply }, { quoted: msg });

      // Cleanup
      fs.unlinkSync(tempFile);

    } catch (err) {
      console.error("Shazam Error:", err);
      await sock.sendMessage(jid, {
        text: `❌ Song recognition failed.\nError: ${err.message}`
      }, { quoted: msg });
    }
  }
};
