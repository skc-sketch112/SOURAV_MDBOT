// lyrics.js
// Usage: .lyrics Tum Hi Ho | .lyrics Ami Banglay Gaan Gai | .lyrics Shape of You

const axios = require("axios");
const cheerio = require("cheerio");
const lyricsFinder = require("lyrics-finder");

module.exports = {
  name: "lyrics",
  command: ["lyrics", "songlyrics"],
  description: "Fetch unlimited lyrics (Hindi, Bengali, English, etc.) with auto language detection + multiple fallbacks.",

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

    // 🔍 Simple language detection
    const isIndian = /[অ-ঔক-हऌए-औक़-ॡঔঅआइউঊএঐওঔ]/.test(query) || /(arijit|shreya|kishore|rafi|lata|sonu|ar rahman|bangla|bengali|hindi|bollywood)/i.test(query);

    try {
      // 🥇 If Indian song, first try Gaana + Lyricsthal
      if (isIndian) {
        console.log("[LYRICS] Detected Indian language, prioritizing Gaana + Lyricsthal...");
        // Gaana
        try {
          const searchUrl = `https://gaana.com/search/${encodeURIComponent(query)}`;
          const searchRes = await axios.get(searchUrl);
          const $ = cheerio.load(searchRes.data);
          const firstSong = $(".rt_arw").attr("href");
          if (firstSong) {
            const songUrl = "https://gaana.com" + firstSong;
            const songRes = await axios.get(songUrl);
            const $$ = cheerio.load(songRes.data);
            const lyrics = $$(".lyrics").text().trim();
            if (lyrics.length > 50) {
              finalLyrics = `🎵 *Lyrics for "${query}"*\n\n${lyrics}`;
            }
          }
        } catch (err) {
          console.warn("[LYRICS] Gaana failed:", err.message);
        }

        // Lyricsthal (Bengali focus)
        if (!finalLyrics) {
          try {
            const searchUrl = `https://www.lyricsthal.com/?s=${encodeURIComponent(query)}`;
            const searchRes = await axios.get(searchUrl);
            const $ = cheerio.load(searchRes.data);
            const firstSong = $(".entry-title a").attr("href");
            if (firstSong) {
              const songRes = await axios.get(firstSong);
              const $$ = cheerio.load(songRes.data);
              const lyrics = $$(".entry-content p").text().trim();
              if (lyrics.length > 50) {
                finalLyrics = `🎵 *Lyrics for "${query}"*\n\n${lyrics}`;
              }
            }
          } catch (err) {
            console.warn("[LYRICS] Lyricsthal failed:", err.message);
          }
        }
      }

      // 🥈 Genius scraping
      if (!finalLyrics) {
        try {
          console.log("[LYRICS] Trying Genius...");
          const searchUrl = `https://genius.com/api/search/multi?per_page=5&q=${encodeURIComponent(query)}`;
          const searchRes = await axios.get(searchUrl);
          const hits = searchRes.data.response.sections.find(s => s.type === "song")?.hits;

          if (hits && hits.length > 0) {
            const songUrl = hits[0].result.url;
            const pageRes = await axios.get(songUrl);
            const $ = cheerio.load(pageRes.data);
            const lyricsElems = $('[data-lyrics-container="true"]');
            lyricsElems.find("br").replaceWith("\n");
            lyricsElems.find("a").replaceWith((_, el) => $(el).text());
            const lyrics = lyricsElems.text().trim();

            if (lyrics && lyrics.length > 50) {
              finalLyrics = `🎵 *${hits[0].result.full_title}*\n\n${lyrics}`;
            }
          }
        } catch (err) {
          console.warn("[LYRICS] Genius failed:", err.message);
        }
      }

      // 🥉 Lyrics.ovh
      if (!finalLyrics) {
        try {
          console.log("[LYRICS] Trying Lyrics.ovh...");
          const [artist, title] = query.split(" - ");
          const res = await axios.get(`https://api.lyrics.ovh/v1/${artist || ""}/${title || query}`);
          if (res.data && res.data.lyrics) {
            finalLyrics = `🎵 *Lyrics for "${query}"*\n\n${res.data.lyrics}`;
          }
        } catch (err) {
          console.warn("[LYRICS] Lyrics.ovh failed:", err.message);
        }
      }

      // 4️⃣ lyrics-finder
      if (!finalLyrics) {
        try {
          console.log("[LYRICS] Trying lyrics-finder...");
          const lyrics = await lyricsFinder("", query);
          if (lyrics) {
            finalLyrics = `🎵 *Lyrics for "${query}"*\n\n${lyrics}`;
          }
        } catch (err) {
          console.warn("[LYRICS] lyrics-finder failed:", err.message);
        }
      }

      // 5️⃣ Musixmatch
      if (!finalLyrics) {
        try {
          console.log("[LYRICS] Trying Musixmatch...");
          const searchUrl = `https://www.musixmatch.com/search/${encodeURIComponent(query)}`;
          const searchRes = await axios.get(searchUrl);
          const $ = cheerio.load(searchRes.data);
          const firstSong = $(".media-card-title a").attr("href");
          if (firstSong) {
            const songUrl = "https://www.musixmatch.com" + firstSong;
            const songRes = await axios.get(songUrl);
            const $$ = cheerio.load(songRes.data);
            const lyrics = $$(".lyrics__content__ok").text().trim();
            if (lyrics.length > 50) {
              finalLyrics = `🎵 *Lyrics for "${query}"*\n\n${lyrics}`;
            }
          }
        } catch (err) {
          console.warn("[LYRICS] Musixmatch failed:", err.message);
        }
      }

      // ❌ All failed
      if (!finalLyrics) {
        finalLyrics = `❌ Sorry, no lyrics found for *${query}*. Try another song.`;
      }

      // ✅ Send result
      await sock.sendMessage(jid, { text: finalLyrics }, { quoted: msg });

    } catch (err) {
      console.error("[LYRICS] Fatal error:", err);
      await sock.sendMessage(
        jid,
        { text: "❌ Failed to fetch lyrics. Please try again later." },
        { quoted: msg }
      );
    }
  }
};
