const axios = require("axios");

module.exports = {
  name: "song",
  command: ["song", "music", "play"],
  execute: async (sock, m, args) => {
    if (!args.length) {
      return await sock.sendMessage(
        m.key.remoteJid,
        { text: "❌ Please provide a song name!\n\nExample: .song despacito" },
        { quoted: m }
      );
    }

    const query = args.join(" ");
    const chatId = m.key.remoteJid;
    await sock.sendMessage(chatId, { text: `🎵 Searching for *${query}*... hang tight` }, { quoted: m });

    // 20+ APIs fallback list
    const apis = [
      q => `https://api.vihangayt.me/download/ytmp3?q=${encodeURIComponent(q)}`,
      q => `https://api.dapuhy.xyz/api/socialmedia/ytplaymp3?query=${encodeURIComponent(q)}&apikey=freeapi`,
      q => `https://api.ryzendesu.vip/api/downloader/ytplaymp3?query=${encodeURIComponent(q)}&apikey=freeapi`,
      q => `https://api.zahwazein.xyz/downloader/ytplaymp3?query=${encodeURIComponent(q)}&apikey=freeapi`,
      q => `https://api.akuari.my.id/downloader/ytplay?query=${encodeURIComponent(q)}`,
      q => `https://api.itsrose.life/tools/ytmp3?url=${encodeURIComponent(q)}&apikey=freeapi`,
      q => `https://api.caliph.biz.id/api/ytplaymp3?query=${encodeURIComponent(q)}&apikey=freeapi`,
      q => `https://api.zeeoneofc.my.id/api/downloader/ytplay?text=${encodeURIComponent(q)}&apikey=freeapi`,
      q => `https://api.botcahx.live/api/dowloader/ytplay?text=${encodeURIComponent(q)}&apikey=freeapi`,
      q => `https://api.lolhuman.xyz/api/ytplay?apikey=freeapi&query=${encodeURIComponent(q)}`,
      q => `https://api.erdwpe.xyz/api/download/ytplay?query=${encodeURIComponent(q)}&apikey=freeapi`,
      q => `https://api.xcodeteam.xyz/api/ytplay?query=${encodeURIComponent(q)}&apikey=freeapi`,
      q => `https://api.siputzx.my.id/api/ytplay?search=${encodeURIComponent(q)}&apikey=freeapi`,
      q => `https://api.alphabot.biz.id/api/ytplaymp3?query=${encodeURIComponent(q)}&apikey=freeapi`,
      q => `https://widipe.com/download/ytplay?text=${encodeURIComponent(q)}&apikey=freeapi`,
      q => `https://api.nyxs.pw/ytplaymp3?text=${encodeURIComponent(q)}&apikey=freeapi`,
      q => `https://musicapi.x007.workers.dev/search?q=${encodeURIComponent(q)}&searchEngine=gaama`,
      q => `https://api.jiosaavn.com/searchSongs?q=${encodeURIComponent(q)}`,
      q => `https://www.theaudiodb.com/api/v1/json/2/searchtrack.php?s=${encodeURIComponent(q)}`,
      q => `https://api.jiosaavn.com/searchSongs?q=${encodeURIComponent(q)}`,
    ];

    let success = false;

    for (let i = 0; i < apis.length; i++) {
      const url = apis[i](query);
      try {
        console.log(`Trying API ${i + 1}: ${url}`);
        const res = await axios.get(url, { timeout: 15000 });
        const data = res.data;

        // Common fields to check for audio URL
        const audioUrl =
          (data?.result && (data.result.url || data.result.download_url || data.result.audio)) ||
          data?.url ||
          data?.audio ||
          null;

        if (audioUrl) {
          await sock.sendMessage(
            chatId,
            { audio: { url: audioUrl }, mimetype: "audio/mp4", fileName: `${query}.mp3` },
            { quoted: m }
          );
          await sock.sendMessage(chatId, { text: `✅ Found via API ${i + 1}` }, { quoted: m });
          success = true;
          break;
        }
      } catch (err) {
        console.error(`API ${i + 1} failed:`, err.message);
      }
    }

    if (!success) {
      await sock.sendMessage(chatId, { text: "❌ All sources failed—try again later." }, { quoted: m });
    }
  },
};
