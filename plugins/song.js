const axios = require("axios");
const fs = require("fs");
const ytdl = require("ytdl-core");
const { jidDecode } = require("@whiskeysockets/baileys");

module.exports = {
  name: "song",
  alias: ["play", "music"],
  desc: "Download songs from multiple APIs with fallback",
  category: "media",
  async exec(client, m, { text, prefix, command }) {
    if (!text) return m.reply(`⚠️ Example: ${prefix + command} despacito`);

    // --- Safe sender handling ---
    const senderJid = m.key?.remoteJid || "unknown@s.whatsapp.net";
    const decoded = jidDecode(senderJid) || {};
    const user = decoded.user || senderJid.split("@")[0];

    // --- API list (15 fallbacks) ---
    const apis = [
      q => `https://api-v1-1.vercel.app/api/song?q=${encodeURIComponent(q)}`,
      q => `https://api.abirhasanpro.me/song?q=${encodeURIComponent(q)}`,
      q => `https://api.giftedtech.my.id/api/download/ytmp3?url=${encodeURIComponent(q)}`,
      q => `https://api.vihangayt.me/search/yt?q=${encodeURIComponent(q)}`,
      q => `https://hadi-api.vercel.app/api/ytmp3?url=${encodeURIComponent(q)}`,
      q => `https://api.zahwazein.xyz/downloader/youtube-mp3?url=${encodeURIComponent(q)}`,
      q => `https://api.fgmods.xyz/api/downloader/ytmp3?url=${encodeURIComponent(q)}`,
      q => `https://itzpire.com/api/ytmp3?url=${encodeURIComponent(q)}`,
      q => `https://lindow-api.herokuapp.com/api/ytmp3?url=${encodeURIComponent(q)}`,
      q => `https://api.nyxs.pw/downloader/ytmp3?url=${encodeURIComponent(q)}`,
      q => `https://api.guruapi.tech/api/ytmp3?url=${encodeURIComponent(q)}`,
      q => `https://api.simsimi.info/api/song?q=${encodeURIComponent(q)}`,
      q => `https://vihangayt.me/api/yt?q=${encodeURIComponent(q)}`,
      q => `https://api.koyeb.app/api/song?q=${encodeURIComponent(q)}`,
      q => `https://saipulanuar.tech/api/song?q=${encodeURIComponent(q)}`
    ];

    let success = false;
    let songUrl = null;

    for (let i = 0; i < apis.length; i++) {
      try {
        const url = apis[i](text);
        console.log(`🎶 Trying API #${i + 1}: ${url}`);
        const res = await axios.get(url, { timeout: 20000 });

        // Some APIs return direct link, some JSON with "url"
        if (res.data && (res.data.result?.url || res.data.url || res.data.download_url)) {
          songUrl = res.data.result?.url || res.data.url || res.data.download_url;
        } else if (res.data && res.data.status && res.data.status === "ok" && res.data.dl_link) {
          songUrl = res.data.dl_link;
        }

        if (songUrl) {
          success = true;
          break; // ✅ Stop if we got valid song
        }
      } catch (err) {
        console.error(`❌ API #${i + 1} failed:`, err.message);
        continue; // Try next API
      }
    }

    if (!success) return m.reply("❌ All 15 APIs failed. Try another song name.");

    try {
      const filePath = "./tmp/song.mp3";
      const writer = fs.createWriteStream(filePath);

      const response = await axios({
        url: songUrl,
        method: "GET",
        responseType: "stream"
      });

      response.data.pipe(writer);

      writer.on("finish", async () => {
        await client.sendMessage(
          m.chat,
          { audio: fs.readFileSync(filePath), mimetype: "audio/mp4", fileName: `${text}.mp3` },
          { quoted: m }
        );
        fs.unlinkSync(filePath);
      });

      writer.on("error", () => {
        m.reply("⚠️ Failed saving audio file.");
      });

    } catch (err) {
      console.error("❌ Song send error:", err.message);
      return m.reply("⚠️ Song fetch failed. Please try again.");
    }
  }
};
