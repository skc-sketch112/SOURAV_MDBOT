const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "song",
  alias: ["music", "play"],
  desc: "Download full songs with 15 fallback APIs",
  category: "media",
  usage: ".song <song name>",
  async execute(sock, m, args) {
    try {
      if (!args[0]) return m.reply("❌ Please provide a song name!");
      let query = args.join(" ");
      m.reply(`🎶 Searching full song for: *${query}* ...`);

      // === 15 APIs List ===
      const apis = [
        { url: `https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}&limit=1`, path: r => r.data?.data?.results?.[0]?.downloadUrl?.[4]?.link },
        { url: `https://wynk-api.vercel.app/search?query=${encodeURIComponent(query)}`, path: r => r.data?.song?.downloadUrl },
        { url: `https://spotifyapi.caliphdevs.workers.dev/?q=${encodeURIComponent(query)}`, path: r => r.data?.url },
        { url: `https://mp3-apis.vercel.app/search?query=${encodeURIComponent(query)}`, path: r => r.data?.result?.[0]?.download_url },
        { url: `https://ganaapi.vercel.app/song?name=${encodeURIComponent(query)}`, path: r => r.data?.downloadUrl },
        { url: `https://hungama-api.vercel.app/search?song=${encodeURIComponent(query)}`, path: r => r.data?.result?.[0]?.downloadUrl },
        { url: `https://boomplay-api.vercel.app/search?query=${encodeURIComponent(query)}`, path: r => r.data?.result?.[0]?.downloadUrl },
        { url: `https://soundapi.vercel.app/find?song=${encodeURIComponent(query)}`, path: r => r.data?.song?.download },
        { url: `https://music-api-1.vercel.app/search?query=${encodeURIComponent(query)}`, path: r => r.data?.result?.[0]?.url },
        { url: `https://music-api-2.vercel.app/search?query=${encodeURIComponent(query)}`, path: r => r.data?.result?.[0]?.url },
        { url: `https://musicapi-bot.vercel.app/song?name=${encodeURIComponent(query)}`, path: r => r.data?.download },
        { url: `https://songs-api.vercel.app/search?q=${encodeURIComponent(query)}`, path: r => r.data?.songs?.[0]?.downloadUrl },
        { url: `https://musix-api.vercel.app/song?query=${encodeURIComponent(query)}`, path: r => r.data?.track?.url },
        { url: `https://tuneapi.vercel.app/find?track=${encodeURIComponent(query)}`, path: r => r.data?.result?.url },
        { url: `https://audiomp3api.vercel.app/search?song=${encodeURIComponent(query)}`, path: r => r.data?.result?.[0]?.download }
      ];

      let url = null, apiIndex = 0;

      // === 🔁 Loop through APIs until success ===
      for (const api of apis) {
        try {
          const res = await axios.get(api.url, { timeout: 15000 });
          url = api.path(res);
          if (url) {
            apiIndex++;
            break;
          }
        } catch (err) {
          apiIndex++;
          continue; // try next API
        }
      }

      if (!url) return m.reply("❌ Song not found on any API (all 15 failed).");

      // Download + Send
      const filePath = path.join(__dirname, `temp_${Date.now()}.mp3`);
      const writer = fs.createWriteStream(filePath);

      const response = await axios({
        url,
        method: "GET",
        responseType: "stream",
        timeout: 60000
      });

      response.data.pipe(writer);

      writer.on("finish", async () => {
        await sock.sendMessage(m.chat, {
          audio: fs.readFileSync(filePath),
          mimetype: "audio/mpeg",
          fileName: `${query}.mp3`
        }, { quoted: m });

        fs.unlinkSync(filePath);
        m.reply(`✅ Song delivered via API #${apiIndex}`);
      });

      writer.on("error", () => {
        m.reply("❌ Error writing file.");
      });

    } catch (err) {
      console.error("SONG ERROR:", err.message);
      m.reply("❌ Failed to fetch song.");
    }
  }
};
