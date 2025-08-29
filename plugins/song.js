const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "song",
  alias: ["music", "play"],
  desc: "Download full songs with 15 fallback APIs (auto retry)",
  category: "media",
  usage: ".song <song name>",
  async execute(sock, m, args) {
    try {
      if (!args[0]) {
        return await sock.sendMessage(m.chat, { text: "❌ Please provide a song name!" }, { quoted: m });
      }

      const query = args.join(" ");
      await sock.sendMessage(m.chat, { text: `🎶 Searching for *${query}*...` }, { quoted: m });

      // === 15 APIs ===
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

      let success = false;

      for (let i = 0; i < apis.length; i++) {
        const api = apis[i];
        const apiNum = i + 1;

        // 🔄 Notify which API is being tried
        await sock.sendMessage(m.chat, { text: `🔄 Trying API #${apiNum} ...` }, { quoted: m });

        try {
          const res = await axios.get(api.url, { timeout: 15000 });
          const url = api.path(res);

          if (!url) {
            await sock.sendMessage(m.chat, { text: `⚠️ API #${apiNum} returned no result.` }, { quoted: m });
            continue;
          }

          const filePath = path.join(__dirname, `temp_${Date.now()}.mp3`);
          const writer = fs.createWriteStream(filePath);

          const response = await axios({
            url,
            method: "GET",
            responseType: "stream",
            timeout: 60000,
            validateStatus: status => status < 400
          });

          response.data.pipe(writer);

          await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
          });

          const stats = fs.statSync(filePath);
          if (stats.size < 50000) {
            fs.unlinkSync(filePath);
            await sock.sendMessage(m.chat, { text: `❌ API #${apiNum} gave broken file. Retrying...` }, { quoted: m });
            continue;
          }

          await sock.sendMessage(
            m.chat,
            {
              audio: fs.readFileSync(filePath),
              mimetype: "audio/mpeg",
              fileName: `${query}.mp3`
            },
            { quoted: m }
          );

          fs.unlinkSync(filePath);
          await sock.sendMessage(m.chat, { text: `✅ Song delivered via API #${apiNum}` }, { quoted: m });
          success = true;
          break;

        } catch (err) {
          await sock.sendMessage(m.chat, { text: `❌ API #${apiNum} failed. Trying next...` }, { quoted: m });
          continue;
        }
      }

      if (!success) {
        await sock.sendMessage(m.chat, { text: "❌ All 15 APIs failed. Song not found." }, { quoted: m });
      }

    } catch (err) {
      console.error("SONG ERROR:", err.message);
      await sock.sendMessage(m.chat, { text: "❌ Fatal error while fetching song." }, { quoted: m });
    }
  }
};
