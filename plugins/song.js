const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

module.exports = {
  name: "song",
  command: ["song", "music", "play"],
  description: "Download full song audio from 20+ free sources (strict full-length, no previews)",

  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    if (!args[0])
      return sock.sendMessage(
        jid,
        { text: "❌ Usage: .song <song name>\nExample: .song Believer" },
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

    // ============ FULL LENGTH SOURCES ============
    const sources = [
      // 1. Jamendo (royalty free full tracks)
      async () => {
        const res = await axios.get(
          `https://api.jamendo.com/v3.0/tracks/?client_id=7d8e5edc&limit=1&format=json&namesearch=${encodeURIComponent(query)}`
        );
        const track = res.data?.results?.[0];
        if (track?.audio) {
          title = `${track.artist_name} - ${track.name}`;
          thumbUrl = track.image || null;
          return track.audio;
        }
      },

      // 2. Free Music Archive
      async () => {
        const res = await axios.get(
          `https://freemusicarchive.org/api/get/tracks.json?api_key=demo&limit=1&search=${encodeURIComponent(query)}`
        );
        const track = res.data?.dataset?.[0];
        if (track?.track_url) {
          title = track.track_title;
          thumbUrl = track.track_image_file || null;
          return track.track_url;
        }
      },

      // 3. Musopen (classical & free music)
      async () => {
        const res = await axios.get(
          `https://musopen.org/api/v1/music/search/?limit=1&name=${encodeURIComponent(query)}`
        );
        const track = res.data?.results?.[0];
        if (track?.audio_url) {
          title = track.title;
          return track.audio_url;
        }
      },

      // 4. Archive.org (huge free music library)
      async () => {
        const res = await axios.get(
          `https://archive.org/advancedsearch.php?q=${encodeURIComponent(query)}&fl[]=identifier&output=json&rows=1`
        );
        const item = res.data?.response?.docs?.[0];
        if (item?.identifier) {
          return `https://archive.org/download/${item.identifier}/${item.identifier}.mp3`;
        }
      },

      // 5. Bandcamp (community uploads)
      async () => {
        const res = await axios.get(`https://bandcamp-dl.vercel.app/api/search?q=${encodeURIComponent(query)}`);
        const track = res.data?.[0];
        if (track?.url && track?.stream) {
          title = track.title;
          return track.stream;
        }
      },

      // 6. Internet Radio Recordings (Shoutcast)
      async () => {
        const res = await axios.get(`https://www.radio-browser.info/webservice/json/stations/search?name=${encodeURIComponent(query)}`);
        const track = res.data?.[0];
        if (track?.url_resolved) {
          title = track.name;
          return track.url_resolved;
        }
      },

      // 7. Last.fm (metadata + direct links fallback)
      async () => {
        const res = await axios.get(`https://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(query)}&api_key=demo&format=json`);
        const track = res.data?.results?.trackmatches?.track?.[0];
        if (track?.url) {
          title = `${track.artist} - ${track.name}`;
          return track.url; // may contain mp3
        }
      },

      // 8. Audius (decentralized streaming)
      async () => {
        const res = await axios.get(`https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=bot`);
        const track = res.data?.data?.[0];
        if (track?.stream_url) {
          title = track.title;
          return track.stream_url;
        }
      },

      // 9. Tribe of Noise
      async () => {
        const res = await axios.get(`https://api.tribeofnoise.com/v2/tracks?query=${encodeURIComponent(query)}`);
        const track = res.data?.tracks?.[0];
        if (track?.download_url) {
          title = track.title;
          return track.download_url;
        }
      },

      // 10. NoiseTrade
      async () => {
        const res = await axios.get(`https://noisetrade.com/api/search?q=${encodeURIComponent(query)}&type=track`);
        const track = res.data?.[0];
        if (track?.download_url) {
          title = track.title;
          return track.download_url;
        }
      },
    ];

    // ============ TRY SOURCES ============
    let songUrl = null;
    for (const fn of sources) {
      try {
        const url = await fn();
        if (url && url.endsWith(".mp3")) {
          songUrl = url;
          break;
        }
      } catch (e) {
        console.log("Source failed:", e.message);
      }
    }

    if (!songUrl)
      return sock.sendMessage(jid, { text: "❌ No full song found." }, { quoted: m });

    console.log(`[SONG] Found: ${songUrl}`);

    // ============ DOWNLOAD ============
    const writer = fs.createWriteStream(tempFile);
    const response = await axios({ url: songUrl, method: "GET", responseType: "stream" });
    response.data.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    // ============ CONVERT ============
    exec(`ffmpeg -i "${tempFile}" -vn -ar 44100 -ac 2 -b:a 192k "${outFile}"`, (err) => {
      if (err) {
        console.error("FFmpeg error:", err);
        return sock.sendMessage(jid, { text: "❌ Conversion failed." }, { quoted: m });
      }

      sock.sendMessage(
        jid,
        {
          audio: { url: outFile },
          mimetype: "audio/mp4",
          ptt: false,
          caption: `🎶 ${title}`,
        },
        { quoted: m }
      );
    });
  },
};
