import ytdl from "ytdl-core";
import yts from "yt-search";
import fs from "fs";
import { pipeline } from "stream";
import { promisify } from "util";
import os from "os";
import axios from "axios";

const streamPipeline = promisify(pipeline);

// ------------------- 10+ API Fallbacks -------------------
const APIs = [
  // 1. yt-search
  async (query) => {
    const res = await yts(`${query} Song`);
    if (res.videos.length) return res.videos[0];
    return null;
  },

  // 2. YouTube Data API v3
  async (query) => {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=YOUR_YOUTUBE_API_KEY&type=video&maxResults=1`;
    try {
      const { data } = await axios.get(searchUrl);
      if (data.items?.length) {
        const video = data.items[0];
        return { title: video.snippet.title, url: `https://www.youtube.com/watch?v=${video.id.videoId}` };
      }
    } catch (e) {}
    return null;
  },

  // 3. play-dl search
  async (query) => {
    try {
      const playdl = await import("play-dl");
      const searchResults = await playdl.search(query, { limit: 1 });
      if (searchResults.length) return { title: searchResults[0].title, url: searchResults[0].url };
    } catch (e) {}
    return null;
  },

  // 4. SoundCloud public search
  async (query) => {
    try {
      const scdl = await import("soundcloud-downloader");
      const result = await scdl.search(query, "track");
      if (result.collection?.length) return { title: result.collection[0].title, url: result.collection[0].permalink_url };
    } catch (e) {}
    return null;
  },

  // 5. Spotify fallback via Play-dl
  async (query) => {
    try {
      const playdl = await import("play-dl");
      if (await playdl.spotify_validate(query) === "track") {
        const track = await playdl.spotify(query);
        return { title: track.name, url: track.url };
      }
    } catch (e) {}
    return null;
  },

  // 6. Shazam
  async (query) => {
    try {
      const shazam = await import("node-shazam");
      const search = new shazam.default();
      const result = await search.search(query);
      if (result?.tracks?.hits?.length) return { title: result.tracks.hits[0].track.title, url: result.tracks.hits[0].track.url };
    } catch (e) {}
    return null;
  },

  // 7. Alternative YouTube search via axios
  async (query) => {
    try {
      const res = await axios.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);
      const match = res.data.match(/\/watch\?v=[\w-]{11}/);
      if (match) return { title: query, url: `https://www.youtube.com${match[0]}` };
    } catch (e) {}
    return null;
  },

  // 8. Another Play-dl fallback
  async (query) => {
    try {
      const playdl = await import("play-dl");
      const results = await playdl.search(query, { source: { youtube: "video" }, limit: 1 });
      if (results.length) return { title: results[0].title, url: results[0].url };
    } catch (e) {}
    return null;
  },

  // 9. YouTube playlist fallback (first video)
  async (query) => {
    try {
      const playdl = await import("play-dl");
      const playlist = await playdl.playlist_info(query).catch(() => null);
      if (playlist?.videos?.length) return { title: playlist.videos[0].title, url: playlist.videos[0].url };
    } catch (e) {}
    return null;
  },

  // 10. Any extra API you want to add
  async (query) => null
];

// ------------------- SONG HANDLER -------------------
const handler = {
  name: "song",
  command: ["song", "music", "play"],
  desc: "Download music from multiple sources reliably",

  async execute(sock, m, args) {
    const chat = m.key.remoteJid;
    const query = args.join(" ");
    if (!query) return await sock.sendMessage(chat, { text: "❌ Please provide a song name!\nExample: .song despacito" }, { quoted: m });

    await sock.sendMessage(chat, { text: "🔎 Searching your song across multiple sources..." }, { quoted: m });

    let video;
    for (let api of APIs) {
      try {
        video = await api(query);
        if (video) break;
      } catch (err) {
        console.error("API fallback error:", err.message);
      }
    }

    if (!video) return await sock.sendMessage(chat, { text: "❌ Could not find your song!" }, { quoted: m });

    const { title, url } = video;

    await sock.sendMessage(chat, { text: `🎧 Downloading: ${title}\n🔗 ${url}` }, { quoted: m });

    try {
      const audioStream = ytdl(url, { filter: "audioonly", quality: "highestaudio" });
      const tmpDir = os.tmpdir();
      const filePath = `${tmpDir}/${title.replace(/[\/\\?%*:|"<>]/g, "_")}.mp3`;

      await streamPipeline(audioStream, fs.createWriteStream(filePath));

      await sock.sendMessage(chat, {
        audio: fs.createReadStream(filePath),
        mimetype: "audio/mp4",
        fileName: `${title}.mp3`
      }, { quoted: m });

      fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete temp audio file:", err);
      });
    } catch (err) {
      console.error("Download/Send Error:", err.message);
      await sock.sendMessage(chat, { text: "❌ Failed to download or send the song." }, { quoted: m });
    }
  }
};

export default handler;
