const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytdl = require("ytdl-core"); // fallback for YouTube audio

module.exports = {
  name: "song",
  alias: ["music", "play"],
  desc: "Download songs using 20+ APIs with fallback system",
  category: "media",
  usage: ".song despacito",
  async execute(sock, m, args) {
    if (!args[0]) {
      return sock.sendMessage(m.key.remoteJid, {
        text: "❌ Please provide a song name!\nExample: .song despacito",
      });
    }

    const query = args.join(" ");
    const apis = [
      // 🎵 Example Free APIs (you can add/edit as needed)
      `https://api-v1-music.vercel.app/spotify?query=${encodeURIComponent(query)}`,
      `https://api.lyrics.ovh/suggest/${encodeURIComponent(query)}`,
      `https://api.napster.com/v2.2/search?apikey=demo&query=${encodeURIComponent(query)}`,
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song`,
      `https://api.deezer.com/search?q=${encodeURIComponent(query)}`,
      `https://saavn.me/search/songs?query=${encodeURIComponent(query)}`,
      `https://api.jiosaavn.dev/?query=${encodeURIComponent(query)}`,
      `https://soundcloud-scraper.p.rapidapi.com/v1/search/tracks?query=${encodeURIComponent(query)}`,
      `https://api.music.apple.com/v1/catalog/us/search?term=${encodeURIComponent(query)}`,
      `https://api-v2.soundcloud.com/search?q=${encodeURIComponent(query)}&client_id=demo`,
      `https://yt-search.vercel.app/search?query=${encodeURIComponent(query)}`,
      `https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(query)}`,
      `https://api-v1-music.vercel.app/yt?q=${encodeURIComponent(query)}`,
      `https://youtube-mp3-download1.p.rapidapi.com/dl?id=${encodeURIComponent(query)}`,
      `https://api.genius.com/search?q=${encodeURIComponent(query)}`,
      `https://api-v1-music.vercel.app/soundcloud?q=${encodeURIComponent(query)}`,
      `https://saavnapi.vercel.app/result/?q=${encodeURIComponent(query)}`,
      `https://musicapi-chi.vercel.app/yt?q=${encodeURIComponent(query)}`,
      `https://songapi-xi.vercel.app/find?query=${encodeURIComponent(query)}`,
      `https://yt-api.eu.org/api/search?query=${encodeURIComponent(query)}`,
    ];

    let success = false;
    let audioPath = null;

    // 🔁 Try each API until one works
    for (const url of apis) {
      try {
        const res = await axios.get(url, { timeout: 10000 });
        let songUrl = null;
        let title = query;

        // 🔎 Parse depending on API response
        if (res.data) {
          if (res.data.data && res.data.data[0]?.downloadUrl) {
            songUrl = res.data.data[0].downloadUrl[0].link;
            title = res.data.data[0].title;
          } else if (res.data.tracks?.hits?.length > 0) {
            songUrl = res.data.tracks.hits[0].track.previewUrl;
            title = res.data.tracks.hits[0].track.name;
          } else if (res.data.results?.length > 0) {
            songUrl = res.data.results[0].previewUrl;
            title = res.data.results[0].trackName;
          } else if (res.data.data?.[0]?.preview) {
            songUrl = res.data.data[0].preview;
            title = res.data.data[0].title;
          }
        }

        if (!songUrl) continue;

        // 🎧 Download audio preview (30-60 sec max)
        audioPath = path.join(__dirname, `${Date.now()}.mp3`);
        const audio = await axios.get(songUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(audioPath, Buffer.from(audio.data, "binary"));

        // ✅ Send audio
        await sock.sendMessage(m.key.remoteJid, {
          audio: { url: audioPath },
          mimetype: "audio/mpeg",
          fileName: `${title}.mp3`,
        }, { quoted: m });

        success = true;
        break; // stop after success
      } catch (e) {
        console.log(`❌ Failed API: ${url}`);
        continue; // try next API
      }
    }

    // 🎵 YouTube fallback if all APIs fail
    if (!success) {
      try {
        const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
        const ytRes = await axios.get(ytUrl);
        const match = ytRes.data.match(/"videoId":"(.*?)"/);
        if (match) {
          const videoId = match[1];
          const stream = ytdl(videoId, { filter: "audioonly", quality: "lowestaudio" });
          audioPath = path.join(__dirname, `${Date.now()}.mp3`);
          const writeStream = fs.createWriteStream(audioPath);
          stream.pipe(writeStream);
          await new Promise(resolve => writeStream.on("finish", resolve));

          await sock.sendMessage(m.key.remoteJid, {
            audio: { url: audioPath },
            mimetype: "audio/mpeg",
            fileName: `${query}.mp3`,
          }, { quoted: m });

          success = true;
        }
      } catch (err) {
        console.log("❌ YouTube fallback failed:", err.message);
      }
    }

    if (!success) {
      await sock.sendMessage(m.key.remoteJid, {
        text: "⚠️ Sorry, all APIs failed to fetch your song. Try again later."
      }, { quoted: m });
    }

    // 🧹 Cleanup after send
    if (audioPath) {
      setTimeout(() => fs.unlinkSync(audioPath), 20000);
    }
  }
};
