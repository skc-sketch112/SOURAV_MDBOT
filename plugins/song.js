const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

module.exports = {
  name: "song",
  command: ["song", "music", "play"],
  description: "Download song audio from 15+ free sources (no YouTube, no API keys)",

  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    if (!args[0])
      return sock.sendMessage(
        jid,
        { text: "❌ Usage: .song <song name>\nExample: .song Despacito" },
        { quoted: m }
      );

    const query = args.join(" ");
    console.log(`[SONG] Searching: ${query}`);

    const downloadsDir = path.join(__dirname, "../downloads");
    if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });

    const tempFile = path.join(downloadsDir, `${Date.now()}.mp4`);
    const outFile = path.join(downloadsDir, `${Date.now()}.mp3`);
    let title = query;
    let thumbUrl = null;

    // ====================== Sources ======================
    const sources = [
      // 1. Jamendo
      async () => {
        try {
          const res = await axios.get(`https://api.jamendo.com/v3.0/tracks/?client_id=7d8e5edc&q=${encodeURIComponent(query)}&limit=1`);
          const track = res.data?.results?.[0];
          if (track?.audio) {
            title = `${track.artist_name} - ${track.name}`;
            thumbUrl = track.image || null;
            return { type: "direct", url: track.audio };
          }
        } catch {}
      },
      // 2. Musopen
      async () => {
        try {
          const res = await axios.get(`https://musopen.org/api/v1/music/?search=${encodeURIComponent(query)}&limit=1`);
          const track = res.data?.results?.[0];
          if (track?.audio_url) {
            title = track.title;
            thumbUrl = track.image || null;
            return { type: "direct", url: track.audio_url };
          }
        } catch {}
      },
      // 3. Deezer
      async () => {
        try {
          const res = await axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=1`);
          const track = res.data?.data?.[0];
          if (track?.preview) {
            title = `${track.artist.name} - ${track.title}`;
            thumbUrl = track.album?.cover_medium || null;
            return { type: "direct", url: track.preview };
          }
        } catch {}
      },
      // 4. FreePD
      async () => {
        try {
          const res = await axios.get(`https://freepd.com/api/search?q=${encodeURIComponent(query)}&limit=1`);
          const track = res.data?.data?.[0];
          if (track?.url) {
            title = track.title;
            thumbUrl = track.image || null;
            return { type: "direct", url: track.url };
          }
        } catch {}
      },
      // 5. ccMixter
      async () => {
        try {
          const res = await axios.get(`https://ccmixter.org/api/query?query=${encodeURIComponent(query)}&limit=1`);
          const track = res.data?.results?.[0];
          if (track?.file_url) {
            title = track.title;
            thumbUrl = track.image || null;
            return { type: "direct", url: track.file_url };
          }
        } catch {}
      },
      // 6. Dogmazic
      async () => {
        try {
          const res = await axios.get(`https://dogmazic.net/api/v1/search?query=${encodeURIComponent(query)}&limit=1`);
          const track = res.data?.data?.[0];
          if (track?.file_url) {
            title = track.title;
            thumbUrl = track.image || null;
            return { type: "direct", url: track.file_url };
          }
        } catch {}
      },
      // 7. Audiomack
      async () => {
        try {
          const res = await axios.get(`https://api.audiomack.com/search?q=${encodeURIComponent(query)}&limit=1`);
          const track = res.data?.data?.[0];
          if (track?.url) {
            title = track.title;
            thumbUrl = track.artwork_url || null;
            return { type: "stream", url: track.url };
          }
        } catch {}
      },
      // 8. Bandcamp
      async () => {
        try {
          const res = await axios.get(`https://bandcamp.com/api/search?q=${encodeURIComponent(query)}&limit=1`);
          const track = res.data?.[0];
          if (track?.url) {
            title = track.title;
            thumbUrl = track.artwork_url || null;
            return { type: "stream", url: track.url };
          }
        } catch {}
      },
      // 9. SoundCloud (public)
      async () => {
        try {
          const res = await axios.get(`https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(query)}&client_id=2t9loNQH90kzJcsFCODdigxfp325aq4z&limit=1`);
          const track = res.data?.collection?.[0];
          if (track?.title) {
            title = track.title;
            thumbUrl = track.artwork_url || null;
            return { type: "stream", url: track.permalink_url };
          }
        } catch {}
      },
      // 10. Free Music Archive (legacy fallback)
      async () => {
        try {
          const res = await axios.get(`https://freemusicarchive.org/api/trackSearch.php?search=${encodeURIComponent(query)}&limit=1`);
          const track = res.data?.data?.[0];
          if (track?.file_url) {
            title = track.title;
            thumbUrl = track.image || null;
            return { type: "direct", url: track.file_url };
          }
        } catch {}
      },
      // 11. Musopen classical (alt)
      async () => {
        try {
          const res = await axios.get(`https://musopen.org/api/v1/music/?limit=1&search=${encodeURIComponent(query)}`);
          const track = res.data?.results?.[0];
          if (track?.audio_url) {
            title = track.title;
            thumbUrl = track.image || null;
            return { type: "direct", url: track.audio_url };
          }
        } catch {}
      },
      // 12. Jamendo alternative
      async () => {
        try {
          const res = await axios.get(`https://api.jamendo.com/v3.0/tracks/?client_id=7d8e5edc&q=${encodeURIComponent(query)}&limit=1`);
          const track = res.data?.results?.[0];
          if (track?.audio) {
            title = `${track.artist_name} - ${track.name}`;
            thumbUrl = track.image || null;
            return { type: "direct", url: track.audio };
          }
        } catch {}
      },
      // 13. Deezer preview alternative
      async () => {
        try {
          const res = await axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=1`);
          const track = res.data?.data?.[0];
          if (track?.preview) {
            title = `${track.artist.name} - ${track.title}`;
            thumbUrl = track.album?.cover_medium || null;
            return { type: "direct", url: track.preview };
          }
        } catch {}
      },
      // 14. ccMixter alt
      async () => {
        try {
          const res = await axios.get(`https://ccmixter.org/api/query?query=${encodeURIComponent(query)}&limit=1`);
          const track = res.data?.results?.[0];
          if (track?.file_url) {
            title = track.title;
            thumbUrl = track.image || null;
            return { type: "direct", url: track.file_url };
          }
        } catch {}
      },
      // 15. Dogmazic alt
      async () => {
        try {
          const res = await axios.get(`https://dogmazic.net/api/v1/search?query=${encodeURIComponent(query)}&limit=1`);
          const track = res.data?.data?.[0];
          if (track?.file_url) {
            title = track.title;
            thumbUrl = track.image || null;
            return { type: "direct", url: track.file_url };
          }
        } catch {}
      },
    ];

    // ====================== Search Sources ======================
    let found = null;
    for (const fn of sources) {
      try {
        const res = await fn();
        if (res) {
          found = res;
          break;
        }
      } catch {}
    }

    if (!found)
      return sock.sendMessage(
        jid,
        { text: "❌ No song found from free sources." },
        { quoted: m }
      );

    console.log(`[SONG] Found via ${found.type}`);

    // ====================== Download Audio ======================
    const writer = fs.createWriteStream(tempFile);
    const response = await axios({ url: found.url, method: "GET", responseType: "stream" });
    response.data.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    // ====================== Convert to MP3 ======================
    exec(`ffmpeg -i ${tempFile} -vn -ar 44100 -ac 2 -b:a 192k ${outFile}`, (err) => {
      if (err) {
        console.error("FFmpeg error:", err);
        return sock.sendMessage(jid, { text: "❌ Audio conversion failed." }, { quoted: m });
      }

      sock.sendMessage(
        jid,
        {
          audio: { url: outFile },
          mimetype: "audio/mp4",
          ptt: true,
          caption: `🎶 ${title}`,
        },
        { quoted: m }
      );
    });
  },
};
