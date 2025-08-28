// lyrics.js
// Usage: .lyrics <song name>

const axios = require("axios");
const cheerio = require("cheerio");
const lyricsFinder = require("lyrics-finder");
const Genius = require("genius-lyrics"); // npm install genius-lyrics

const geniusClient = new Genius.Client();

axios.defaults.timeout = 5000; // ⏱️ Timeout 5s per request

module.exports = {
  name: "lyrics",
  command: ["lyrics", "songlyrics"],
  description: "Fetch lyrics from 12+ sources with auto-fallback (Hindi, Bengali, English, etc.)",

  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;

    if (!args[0]) {
      return sock.sendMessage(
        jid,
        { text: "❌ Usage: .lyrics <song name>\n\nExample: `.lyrics Tum Hi Ho`" },
        { quoted: msg }
      );
    }

    const query = args.join(" ");
    console.log(`[LYRICS] Searching for: ${query}`);

    let finalLyrics = null;

    // 🌐 Sources Queue (in order of priority)
    const sources = [
      // 1️⃣ Genius API
      async () => {
        const searches = await geniusClient.songs.search(query);
        if (searches.length > 0) {
          const song = searches[0];
          const lyrics = await song.lyrics();
          return lyrics ? `🎵 *${song.fullTitle}*\n\n${lyrics}` : null;
        }
      },

      // 2️⃣ Lyrics.ovh
      async () => {
        const [artist, title] = query.split(" - ");
        const res = await axios.get(
          `https://api.lyrics.ovh/v1/${artist || ""}/${title || query}`
        );
        return res.data && res.data.lyrics
          ? `🎵 *Lyrics for "${query}"*\n\n${res.data.lyrics}`
          : null;
      },

      // 3️⃣ lyrics-finder
      async () => {
        const lyrics = await lyricsFinder("", query);
        return lyrics ? `🎵 *Lyrics for "${query}"*\n\n${lyrics}` : null;
      },

      // 4️⃣ AZLyrics
      async () => {
        const searchUrl = `https://search.azlyrics.com/search.php?q=${encodeURIComponent(
          query
        )}`;
        const searchRes = await axios.get(searchUrl);
        const $ = cheerio.load(searchRes.data);
        const firstSong = $(".visitedlyr a").attr("href");
        if (firstSong) {
          const songRes = await axios.get(firstSong);
          const $$ = cheerio.load(songRes.data);
          const lyrics = $$(".ringtone").nextAll("div").text().trim();
          return lyrics && lyrics.length > 50
            ? `🎵 *Lyrics for "${query}"*\n\n${lyrics}`
            : null;
        }
      },

      // 5️⃣ SongLyrics.com
      async () => {
        const searchUrl = `http://www.songlyrics.com/index.php?section=search&searchW=${encodeURIComponent(
          query
        )}&submit=Search`;
        const searchRes = await axios.get(searchUrl);
        const $ = cheerio.load(searchRes.data);
        const firstSong = $(".serpresult h3 a").attr("href");
        if (firstSong) {
          const songRes = await axios.get(firstSong);
          const $$ = cheerio.load(songRes.data);
          const lyrics = $$("#songLyricsDiv").text().trim();
          return lyrics && lyrics.length > 50
            ? `🎵 *Lyrics for "${query}"*\n\n${lyrics}`
            : null;
        }
      },

      // 6️⃣ LyricsFreak
      async () => {
        const searchUrl = `https://www.lyricsfreak.com/search.php?a=search&type=song&q=${encodeURIComponent(
          query
        )}`;
        const searchRes = await axios.get(searchUrl);
        const $ = cheerio.load(searchRes.data);
        const firstSong = $(".song").first().find("a").attr("href");
        if (firstSong) {
          const songUrl = "https://www.lyricsfreak.com" + firstSong;
          const songRes = await axios.get(songUrl);
          const $$ = cheerio.load(songRes.data);
          const lyrics = $$(".lyrictxt").text().trim();
          return lyrics && lyrics.length > 50
            ? `🎵 *Lyrics for "${query}"*\n\n${lyrics}`
            : null;
        }
      },

      // 7️⃣ Musixmatch
      async () => {
        const searchUrl = `https://www.musixmatch.com/search/${encodeURIComponent(
          query
        )}`;
        const searchRes = await axios.get(searchUrl);
        const $ = cheerio.load(searchRes.data);
        const firstSong = $(".media-card-title a").attr("href");
        if (firstSong) {
          const songUrl = "https://www.musixmatch.com" + firstSong;
          const songRes = await axios.get(songUrl);
          const $$ = cheerio.load(songRes.data);
          const lyrics = $$(".lyrics__content__ok").text().trim();
          return lyrics && lyrics.length > 50
            ? `🎵 *Lyrics for "${query}"*\n\n${lyrics}`
            : null;
        }
      },

      // 8️⃣ Lyricsthal (Bengali/Hindi)
      async () => {
        const searchUrl = `https://www.lyricsthal.com/?s=${encodeURIComponent(
          query
        )}`;
        const searchRes = await axios.get(searchUrl);
        const $ = cheerio.load(searchRes.data);
        const firstSong = $(".entry-title a").attr("href");
        if (firstSong) {
          const songRes = await axios.get(firstSong);
          const $$ = cheerio.load(songRes.data);
          const lyrics = $$(".entry-content p").text().trim();
          return lyrics && lyrics.length > 50
            ? `🎵 *Lyrics for "${query}"*\n\n${lyrics}`
            : null;
        }
      },

      // 9️⃣ Gaana
      async () => {
        const searchUrl = `https://gaana.com/search/${encodeURIComponent(query)}`;
        const searchRes = await axios.get(searchUrl);
        const $ = cheerio.load(searchRes.data);
        const firstSong = $(".rt_arw").attr("href");
        if (firstSong) {
          const songUrl = "https://gaana.com" + firstSong;
          const songRes = await axios.get(songUrl);
          const $$ = cheerio.load(songRes.data);
          const lyrics = $$(".lyrics").text().trim();
          return lyrics && lyrics.length > 50
            ? `🎵 *Lyrics for "${query}"*\n\n${lyrics}`
            : null;
        }
      },

      // 🔟 ChartLyrics API
      async () => {
        const res = await axios.get(
          `http://api.chartlyrics.com/apiv1.asmx/SearchLyricDirect?artist=&song=${encodeURIComponent(
            query
          )}`
        );
        if (res.data && res.data.includes("<Lyric>")) {
          const lyrics = res.data.split("<Lyric>")[1].split("</Lyric>")[0];
          return lyrics && lyrics.length > 50
            ? `🎵 *Lyrics for "${query}"*\n\n${lyrics}`
            : null;
        }
      },
    ];

    // 🚀 Loop through sources until one works
    for (let i = 0; i < sources.length; i++) {
      try {
        console.log(`[LYRICS] Trying source ${i + 1}`);
        finalLyrics = await sources[i]();
        if (finalLyrics) break; // stop once found
      } catch (err) {
        console.warn(`[LYRICS] Source ${i + 1} failed:`, err.message);
      }
    }

    // ❌ All failed
    if (!finalLyrics) {
      finalLyrics = `❌ Sorry, no lyrics found for *${query}*. Try another song.`;
    }

    // ✅ Send result
    await sock.sendMessage(jid, { text: finalLyrics }, { quoted: msg });
  },
};
