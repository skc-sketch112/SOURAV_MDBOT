const axios = require("axios");

module.exports = {
  name: "song",
  command: ["song", "music", "play"],
  desc: "Find & download songs using 15+ fresh APIs, stop when success",
  async execute(sock, m, args) {
    if (!args[0]) {
      return sock.sendMessage(m.key.remoteJid, {
        text: "❌ Please provide a song name!\nExample: .song despacito"
      }, { quoted: m });
    }

    const query = args.join(" ");
    const chat = m.key.remoteJid;
    await sock.sendMessage(chat, { text: `🔎 Searching for *${query}*...` }, { quoted: m });

    // ========== Fresh API List ==========
    const apis = [
      // YouTube -> MP3 via unofficial API
      q => `https://youtube-download-api.matheusishiyama.repl.co/mp3?url=${encodeURIComponent("https://youtu.be/" + q)}`,

      // Public domain music sources
      async q => {
        const res = await axios.get(`https://api.jamendo.com/v3.0/tracks/?client_id=YOUR_CLIENT_ID&limit=1&format=json&search=${encodeURIComponent(q)}`);
        return res.data.results?.[0]?.audio || null;
      }, // Jamendo 5

      async q => {
        const res = await axios.get(`https://api.musopen.org/v1/music/?search=${encodeURIComponent(q)}&limit=1`);
        return res.data.results?.[0]?.audio_url || null;
      }, // Musopen 6

      async q => {
        const res = await axios.get(`https://archive.org/advancedsearch.php?q=${encodeURIComponent(q)}+AND+collection:etree&fl[]=identifier&output=json&rows=1`);
        const id = res.data.response?.docs?.[0]?.identifier;
        return id ? `https://archive.org/download/${id}/${id}.mp3` : null;
      }, // Live Music Archive 7

      // SoundCloud iframe-based downloader
      q => `https://soundclouddownloader.info/iframe-api/?t=${encodeURIComponent(q)}`,

      // Community-built generic music search (deprecated but worth a shot)
      async q => {
        const res = await axios.get(`https://musicapi.x007.workers.dev/search?q=${encodeURIComponent(q)}&searchEngine=gaama`);
        return res.data.response?.[0]?.id ? `https://musicapi.x007.workers.dev/play?id=${res.data.response[0].id}` : null;
      }, // 8

      // Fallback to JSON converter endpoint
      q => `https://api.download-lagu-mp3.com/@api/json/mp3/${encodeURIComponent(q)}`, // Video ID needed 9

      // Additional common converter endpoints
      q => `https://api.zahwazein.xyz/downloader/ytplay?query=${encodeURIComponent(q)}`,
      q => `https://api.neoxr.eu.org/api/spotify?query=${encodeURIComponent(q)}`,
      q => `https://api.akuari.my.id/downloader/playmp3?query=${encodeURIComponent(q)}`,
      q => `https://api.fgmods.xyz/api/downloader/ytmp3?url=${encodeURIComponent(q)}`,
      q => `https://api.lolhuman.xyz/api/ytplay?apikey=free&query=${encodeURIComponent(q)}`,
      q => `https://api.safone.dev/api/play?query=${encodeURIComponent(q)}`,
      q => `https://api.xteam.xyz/dl/ytplay?url=${encodeURIComponent(q)}&APIKEY=free`,
      q => `https://api.caliph.biz.id/api/spotify?query=${encodeURIComponent(q)}&apikey=free`
    ];

    let success = false;

    for (let i = 0; i < apis.length; i++) {
      try {
        let url = typeof apis[i] === "function" ? await apis[i](query) : apis[i](query);
        console.log(`Trying API ${i + 1}:`, url);

        if (!url) continue;
        const res = await axios.get(url, { responseType: "arraybuffer", timeout: 20000 });
        if (res.status === 200 && res.data) {
          await sock.sendMessage(chat, { audio: res.data, mimetype: "audio/mp4" }, { quoted: m });
          await sock.sendMessage(chat, { text: `✅ Found via API ${i + 1}` }, { quoted: m });
          success = true;
          break;
        }
      } catch (err) {
        console.log(`API ${i + 1} failed:`, err.message);
      }
    }

    if (!success) {
      await sock.sendMessage(chat, {
        text: "❌ All attempts failed—no song found. Consider providing a YouTube link instead."
      }, { quoted: m });
    }
  }
};
