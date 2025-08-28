const Genius = require("genius-lyrics");
const axios = require("axios");
const cheerio = require("cheerio");
const lyricsFinder = require("lyrics-finder");

module.exports = {
  name: "lyrics",
  command: ["lyrics", "songlyrics"],
  description: "Fetch unlimited lyrics for any song with multiple fallback",

  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;

    try {
      if (!args[0]) {
        return sock.sendMessage(jid, { 
          text: "❌ Usage: .lyrics <song name>
Example: .lyrics Tum Hi Ho" 
        }, { quoted: msg });
      }
      const query = args.join(" ");
      
      // 1. Genius API main attempt
      try {
        const client = new Genius.Client(process.env.GENIUS_ACCESS_TOKEN || "");
        const searches = await client.songs.search(query);
        if (searches.length > 0) {
          const song = searches[0];
          const lyrics = await song.lyrics();
          if (lyrics) {
            const text = `🎵 *${song.title}* by *${song.artist.name}*

${lyrics}`;
            return await sock.sendMessage(jid, { text }, { quoted: msg });
          }
        }
      } catch (err) {
        console.warn("Genius API fetch failed:", err);
      }

      // 2. Genius web scraping fallback
      try {
        const searchUrl = `https://api.genius.com/search?q=${encodeURIComponent(query)}`;
        const response = await axios.get(searchUrl, {
          headers: { Authorization: `Bearer ${process.env.GENIUS_ACCESS_TOKEN}` }
        });

        if (response.data.response.hits.length > 0) {
          const songUrl = response.data.response.hits[0].result.url;
          const pageHtml = await axios.get(songUrl);
          const $ = cheerio.load(pageHtml.data);

          // Extract lyrics container
          const lyricsElems = $('[data-lyrics-container="true"]');
          if (lyricsElems.length) {
            // Replace <br> with new lines & strip anchors but keep text
            lyricsElems.find("br").replaceWith("
");
            lyricsElems.find("a").replaceWith((_, el) => $(el).text());
            const lyricsText = lyricsElems.text().trim();

            if (lyricsText.length > 20) {
              const text = `🎵 *Lyrics for "${query}"*

${lyricsText}`;
              return await sock.sendMessage(jid, { text }, { quoted: msg });
            }
          }
        }
      } catch (err) {
        console.warn("Lyrics scraping failed:", err);
      }

      // 3. lyrics-finder npm package as last resort
      try {
        const lyrics = await lyricsFinder(query, "");
        if (lyrics) {
          const text = `🎵 *Lyrics for "${query}"*

${lyrics}`;
          return await sock.sendMessage(jid, { text }, { quoted: msg });
        }
      } catch (err) {
        console.warn("lyrics-finder failed:", err);
      }

      // If all fail
      await sock.sendMessage(jid, { text: "❌ Sorry, no lyrics found for your query." }, { quoted: msg });

    } catch (error) {
      console.error("Lyrics plugin error:", error);
      await sock.sendMessage(jid, { text: "❌ Failed to fetch lyrics, please try again later." }, { quoted: msg });
    }
  }
};
