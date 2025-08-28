// shazam.js
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const { getLyrics } = require("genius-lyrics-api");

module.exports = {
  name: "shazam",
  command: ["shazam", "findsong"],
  description: "Identify songs + fetch lyrics (Multi-Engine Ultra Power)",

  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;
    try {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted || !quoted.audioMessage) {
        return sock.sendMessage(
          jid,
          { text: "🎵 Reply to an *audio/voice note* to identify the song!" },
          { quoted: msg }
        );
      }

      // Download audio
      const buffer = await sock.downloadMediaMessage({ message: quoted });
      if (!buffer) throw new Error("Failed to download audio!");

      const filePath = path.join(__dirname, `../downloads/shazam_${Date.now()}.ogg`);
      fs.writeFileSync(filePath, buffer);

      // ---- API KEYS (put your own) ----
      const API_KEYS = {
        AUDD: "YOUR_AUDD_KEY",
        SHAZAM_RAPID: "YOUR_RAPIDAPI_KEY",
        ACRCLOUD: { key: "YOUR_ACR_KEY", secret: "YOUR_ACR_SECRET" },
        GENIUS: "YOUR_GENIUS_KEY"
      };

      let title = null, artist = null;

      // ============= ENGINE 1: AUDD.IO =============
      try {
        const formData = new FormData();
        formData.append("file", fs.createReadStream(filePath));
        formData.append("return", "apple_music,spotify");
        formData.append("api_token", API_KEYS.AUDD);

        const res = await axios.post("https://api.audd.io/recognize", formData, {
          headers: formData.getHeaders(),
        });

        if (res.data?.result?.title) {
          title = res.data.result.title;
          artist = res.data.result.artist;
          console.log("AUDD SUCCESS:", title, artist);
        }
      } catch (err) {
        console.log("AUDD Failed:", err.message);
      }

      // ============= ENGINE 2: SHAZAM RAPIDAPI =============
      if (!title) {
        try {
          const formData = new FormData();
          formData.append("upload_file", fs.createReadStream(filePath));

          const res = await axios.post("https://shazam.p.rapidapi.com/songs/v2/detect", formData, {
            headers: {
              "x-rapidapi-key": API_KEYS.SHAZAM_RAPID,
              "x-rapidapi-host": "shazam.p.rapidapi.com",
              ...formData.getHeaders(),
            },
          });

          if (res.data?.track?.title) {
            title = res.data.track.title;
            artist = res.data.track.subtitle;
            console.log("SHAZAM SUCCESS:", title, artist);
          }
        } catch (err) {
          console.log("SHAZAM Failed:", err.message);
        }
      }

      // ============= ENGINE 3: ACRCloud =============
      if (!title) {
        try {
          // Simplified fingerprint recognition
          const base64 = buffer.toString("base64");
          const timestamp = Math.floor(Date.now() / 1000);
          const stringToSign = ["POST", "/v1/identify", API_KEYS.ACRCLOUD.key, "audio", timestamp].join("\n");
          const signature = require("crypto")
            .createHmac("sha1", API_KEYS.ACRCLOUD.secret)
            .update(stringToSign)
            .digest("base64");

          const formData = new FormData();
          formData.append("sample", buffer, { filename: "audio.ogg" });
          formData.append("access_key", API_KEYS.ACRCLOUD.key);
          formData.append("data_type", "audio");
          formData.append("signature", signature);
          formData.append("sample_bytes", buffer.length);
          formData.append("timestamp", timestamp);

          const res = await axios.post("https://identify-eu-west-1.acrcloud.com/v1/identify", formData, {
            headers: formData.getHeaders(),
          });

          if (res.data?.metadata?.music?.length > 0) {
            title = res.data.metadata.music[0].title;
            artist = res.data.metadata.music[0].artists[0].name;
            console.log("ACRCloud SUCCESS:", title, artist);
          }
        } catch (err) {
          console.log("ACRCloud Failed:", err.message);
        }
      }

      // ============= ENGINE 4: Deezer Search fallback =============
      if (!title) {
        try {
          const q = encodeURIComponent(args.join(" ") || "song");
          const res = await axios.get(`https://api.deezer.com/search?q=${q}`);
          if (res.data?.data?.length > 0) {
            title = res.data.data[0].title;
            artist = res.data.data[0].artist.name;
            console.log("Deezer Fallback:", title, artist);
          }
        } catch (err) {
          console.log("Deezer Failed:", err.message);
        }
      }

      // ============= ENGINE 5: Spotify Search fallback =============
      if (!title) {
        try {
          const q = encodeURIComponent(args.join(" ") || "song");
          const res = await axios.get(
            `https://api.spotify.com/v1/search?q=${q}&type=track&limit=1`,
            { headers: { Authorization: `Bearer ${"YOUR_SPOTIFY_TOKEN"}` } }
          );
          if (res.data.tracks.items.length > 0) {
            title = res.data.tracks.items[0].name;
            artist = res.data.tracks.items[0].artists[0].name;
            console.log("Spotify Fallback:", title, artist);
          }
        } catch (err) {
          console.log("Spotify Failed:", err.message);
        }
      }

      fs.unlinkSync(filePath);

      if (!title) {
        return sock.sendMessage(jid, { text: "❌ Could not recognize the song from any engine." }, { quoted: msg });
      }

      // Fetch lyrics (Genius)
      let reply = `🎶 *${title}* - ${artist}\n\n`;
      try {
        const lyrics = await getLyrics({
          apiKey: API_KEYS.GENIUS,
          title,
          artist,
          optimizeQuery: true,
        });
        reply += lyrics ? `📑 Lyrics:\n\n${lyrics}` : "❌ Lyrics not found.";
      } catch {
        reply += "⚠️ Lyrics lookup failed.";
      }

      await sock.sendMessage(jid, { text: reply }, { quoted: msg });

    } catch (err) {
      console.error("Shazam Error:", err);
      await sock.sendMessage(jid, { text: "❌ Failed to identify song." }, { quoted: msg });
    }
  }
};
