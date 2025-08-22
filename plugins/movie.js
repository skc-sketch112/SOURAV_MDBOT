const fetch = require("node-fetch");

module.exports = {
  name: "movie",
  command: ["movie", "film"],
  description: "Get unlimited movie info (no API key required, fallback supported)",

  execute: async (sock, m, args) => {
    const jid = m.key.remoteJid;
    const query = args.join(" ");

    if (!query) {
      await sock.sendMessage(jid, { text: "🎬 Please provide a movie name!\n👉 Example: *.movie Avatar*" }, { quoted: m });
      return;
    }

    try {
      // Primary: OMDB Free Mirror
      const omdbURL = `https://www.omdbapi.com/?t=${encodeURIComponent(query)}&plot=full&apikey=564727fa`; 
      const res = await safeFetch(omdbURL, 10000);
      const data = await res.json();

      if (data && data.Response === "True") {
        const msg = `
🎬 *${data.Title}* (${data.Year})
⭐ IMDB: ${data.imdbRating || "N/A"}
🎭 Genre: ${data.Genre || "N/A"}
🎥 Director: ${data.Director || "N/A"}
✍️ Writer: ${data.Writer || "N/A"}
🎙️ Actors: ${data.Actors || "N/A"}
🗓️ Released: ${data.Released || "N/A"}
🌍 Language: ${data.Language || "N/A"}
🏆 Awards: ${data.Awards || "N/A"}

📖 *Plot*:
${data.Plot || "No plot available."}
        `.trim();

        if (data.Poster && data.Poster !== "N/A") {
          await sock.sendMessage(
            jid,
            { image: { url: data.Poster }, caption: msg },
            { quoted: m }
          );
        } else {
          await sock.sendMessage(jid, { text: msg }, { quoted: m });
        }
        return;
      }

      // Fallback: TMDB Search
      const tmdbSearch = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1&api_key=1ea6a5c8c6d1a59c5b66f0f6f8a0f1b8`; 
      const res2 = await safeFetch(tmdbSearch, 10000);
      const data2 = await res2.json();

      if (data2 && data2.results && data2.results.length > 0) {
        const movie = data2.results[0];
        const msg = `
🎬 *${movie.title}* (${movie.release_date ? movie.release_date.split("-")[0] : "N/A"})
⭐ Rating: ${movie.vote_average || "N/A"} / 10
📖 Overview:
${movie.overview || "No description available."}
        `.trim();

        if (movie.poster_path) {
          await sock.sendMessage(
            jid,
            { image: { url: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }, caption: msg },
            { quoted: m }
          );
        } else {
          await sock.sendMessage(jid, { text: msg }, { quoted: m });
        }
        return;
      }

      // If both fail
      await sock.sendMessage(jid, { text: `❌ No results found for "${query}".` }, { quoted: m });

    } catch (err) {
      console.error("❌ Movie plugin error:", err);
      await sock.sendMessage(jid, { text: "⚠️ Failed to fetch movie details. Please try again later." }, { quoted: m });
    }
  }
};

/* -------------------- Helpers -------------------- */
async function safeFetch(url, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
}
