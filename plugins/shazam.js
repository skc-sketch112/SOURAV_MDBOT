// shazam.js
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const ytdl = require("ytdl-core"); // YouTube fallback
const { exec } = require("child_process");
const { getLyrics } = require("genius-lyrics-api");

module.exports = {
  name: "shazam",
  command: ["shazam", "findsong"],
  description: "Identify songs + fetch lyrics (Ultra Free Multi-Engine)",

  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;

    try {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted || (!quoted.audioMessage && !quoted.documentMessage)) {
        return sock.sendMessage(
          jid,
          { text: "🎵 Reply to an *audio/voice note* to identify the song!" },
          { quoted: msg }
        );
      }

      // Download audio
      const buffer = await sock.downloadMediaMessage({ message: quoted });
      if (!buffer) throw new Error("Failed to download audio!");

      const downloadsDir = path.join(__dirname, "../downloads");
      if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });

      const filePath = path.join(downloadsDir, `shazam_${Date.now()}.ogg`);
      fs.writeFileSync(filePath, buffer);

      let title = null;
      let artist = null;
      let sourceUsed = null;

      // ======= Free Multi-Engine Identification =======
      const engines = [
        // 1. Deezer Search
        async () => {
          if (title) return;
          try {
            const q = encodeURIComponent(args.join(" ") || "song");
            const res = await axios.get(`https://api.deezer.com/search?q=${q}`);
            if (res.data?.data?.length) {
              title = res.data.data[0].title;
              artist = res.data.data[0].artist.name;
              sourceUsed = "Deezer";
            }
          } catch {}
        },
        // 2. Free Music Archive
        async () => {
          if (title) return;
          try {
            const q = encodeURIComponent(args.join(" "));
            const res = await axios.get(`https://freemusicarchive.org/api/trackSearch.php?search=${q}&limit=1`);
            const track = res.data?.data?.[0];
            if (track?.title) {
              title = track.title;
              artist = track.artist || "Unknown";
              sourceUsed = "FMA";
            }
          } catch {}
        },
        // 3. Jamendo
        async () => {
          if (title) return;
          try {
            const q = encodeURIComponent(args.join(" "));
            const res = await axios.get(`https://api.jamendo.com/v3.0/tracks/?client_id=7d8e5edc&q=${q}&limit=1`);
            const track = res.data?.results?.[0];
            if (track?.name) {
              title = track.name;
              artist = track.artist_name || "Unknown";
              sourceUsed = "Jamendo";
            }
          } catch {}
        },
        // 4. Musopen
        async () => {
          if (title) return;
          try {
            const q = encodeURIComponent(args.join(" "));
            const res = await axios.get(`https://musopen.org/api/v1/music/?search=${q}&limit=1`);
            const track = res.data?.results?.[0];
            if (track?.title) {
              title = track.title;
              artist = track.composer || "Unknown";
              sourceUsed = "Musopen";
            }
          } catch {}
        },
        // 5. FreePD
        async () => {
          if (title) return;
          try {
            const q = encodeURIComponent(args.join(" "));
            const res = await axios.get(`https://freepd.com/api/search?q=${q}&limit=1`);
            const track = res.data?.data?.[0];
            if (track?.title) {
              title = track.title;
              artist = track.artist || "Unknown";
              sourceUsed = "FreePD";
            }
          } catch {}
        },
        // 6. ccMixter
        async () => {
          if (title) return;
          try {
            const q = encodeURIComponent(args.join(" "));
            const res = await axios.get(`https://ccmixter.org/api/query?query=${q}&limit=1`);
            const track = res.data?.results?.[0];
            if (track?.title) {
              title = track.title;
              artist = track.artist || "Unknown";
              sourceUsed = "ccMixter";
            }
          } catch {}
        },
        // 7. Dogmazic
        async () => {
          if (title) return;
          try {
            const q = encodeURIComponent(args.join(" "));
            const res = await axios.get(`https://dogmazic.net/api/v1/search?query=${q}&limit=1`);
            const track = res.data?.data?.[0];
            if (track?.title) {
              title = track.title;
              artist = track.artist || "Unknown";
              sourceUsed = "Dogmazic";
            }
          } catch {}
        },
        // 8. Audiomack
        async () => {
          if (title) return;
          try {
            const q = encodeURIComponent(args.join(" "));
            const res = await axios.get(`https://api.audiomack.com/search?q=${q}&limit=1`);
            const track = res.data?.data?.[0];
            if (track?.title) {
              title = track.title;
              artist = track.artist || "Unknown";
              sourceUsed = "Audiomack";
            }
          } catch {}
        },
        // 9. Bandcamp
        async () => {
          if (title) return;
          try {
            const q = encodeURIComponent(args.join(" "));
            const res = await axios.get(`https://bandcamp.com/api/search?q=${q}&limit=1`);
            const track = res.data?.[0];
            if (track?.title) {
              title = track.title;
              artist = track.artist || "Unknown";
              sourceUsed = "Bandcamp";
            }
          } catch {}
        },
        // 10. Mixcloud
        async () => {
          if (title) return;
          try {
            const q = encodeURIComponent(args.join(" "));
            const res = await axios.get(`https://api.mixcloud.com/search?q=${q}&limit=1`);
            const track = res.data?.data?.[0];
            if (track?.name) {
              title = track.name;
              artist = track.artist || "Unknown";
              sourceUsed = "Mixcloud";
            }
          } catch {}
        },
        // 11. SoundCloud Public Search
        async () => {
          if (title) return;
          try {
            const q = encodeURIComponent(args.join(" "));
            const res = await axios.get(`https://api-v2.soundcloud.com/search/tracks?q=${q}&client_id=2t9loNQH90kzJcsFCODdigxfp325aq4z`);
            const track = res.data?.collection?.[0];
            if (track?.title) {
              title = track.title;
              artist = track.user?.username || "Unknown";
              sourceUsed = "SoundCloud";
            }
          } catch {}
        },
        // 12. YouTube Fallback
        async () => {
          if (title) return;
          try {
            const searchRes = await axios.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(args.join(" "))}`);
            const html = searchRes.data;
            const videoIdMatch = html.match(/"videoId":"(.*?)"/);
            if (videoIdMatch) {
              title = args.join(" ");
              artist = "YouTube";
              sourceUsed = "YouTube Fallback";
            }
          } catch {}
        },
      ];

      // Run all engines sequentially
      for (const engine of engines) {
        await engine();
        if (title) break;
      }

      if (!title) return sock.sendMessage(jid, { text: "❌ Could not recognize the song." }, { quoted: msg });

      // Fetch lyrics using Genius (optional, free without keys can use scrapers if needed)
      let reply = `🎶 *${title}* - ${artist}\nSource: ${sourceUsed}\n\n`;
      try {
        const lyrics = await getLyrics({
          apiKey: null, // free fallback
          title,
          artist,
          optimizeQuery: true,
        });
        reply += lyrics ? `📑 Lyrics:\n${lyrics}` : "❌ Lyrics not found.";
      } catch {
        reply += "⚠️ Lyrics lookup failed.";
      }

      await sock.sendMessage(jid, { text: reply }, { quoted: msg });
    } catch (err) {
      console.error("Shazam Error:", err);
      await sock.sendMessage(jid, { text: "❌ Failed to identify song." }, { quoted: msg });
    }
  },
};
