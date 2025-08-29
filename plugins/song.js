const axios = require("axios");

module.exports = {
  name: "song",
  command: ["song", "music", "play"],
  desc: "Download songs from 20+ APIs until success",
  async execute(sock, m, args) {
    if (!args[0]) {
      return sock.sendMessage(m.key.remoteJid, {
        text: "❌ Please provide a song name!\nExample: .song despacito"
      }, { quoted: m });
    }

    const query = args.join(" ");
    const chat = m.key.remoteJid;
    await sock.sendMessage(chat, { text: `🔎 Searching for *${query}*...` }, { quoted: m });

    // ========== API List ==========
    const apis = [
      async q => {
        let res = await axios.get(`https://api.zahwazein.xyz/downloader/ytplay?query=${encodeURIComponent(q)}`);
        return res.data?.result?.url || null;
      },
      async q => {
        let res = await axios.get(`https://api.lolhuman.xyz/api/ytplay?apikey=free&query=${encodeURIComponent(q)}`);
        return res.data?.result?.audio?.link || null;
      },
      async q => {
        let res = await axios.get(`https://api.fgmods.xyz/api/downloader/ytmp3?url=${encodeURIComponent(q)}`);
        return res.data?.result?.download_url || null;
      },
      async q => {
        let res = await axios.get(`https://api.akuari.my.id/downloader/playmp3?query=${encodeURIComponent(q)}`);
        return res.data?.result?.url || null;
      },
      async q => {
        let res = await axios.get(`https://api.safone.dev/api/play?query=${encodeURIComponent(q)}`);
        return res.data?.result?.download_url || null;
      },
      async q => {
        let res = await axios.get(`https://api.xteam.xyz/dl/ytplay?url=${encodeURIComponent(q)}&APIKEY=free`);
        return res.data?.result?.audio || null;
      },
      async q => {
        let res = await axios.get(`https://api.caliph.biz.id/api/spotify?query=${encodeURIComponent(q)}&apikey=free`);
        return res.data?.result?.url || null;
      },
      async q => {
        let res = await axios.get(`https://api.neoxr.eu.org/api/spotify?query=${encodeURIComponent(q)}`);
        return res.data?.result?.download_url || null;
      },
      async q => {
        let res = await axios.get(`https://api-v1.xyzuan.repl.co/api/ytplay?text=${encodeURIComponent(q)}`);
        return res.data?.result?.link || null;
      },
      async q => {
        let res = await axios.get(`https://api.dreaded.workers.dev/play?query=${encodeURIComponent(q)}`);
        return res.data?.result?.url || null;
      },
      async q => {
        let res = await axios.get(`https://api-v1.guruapi.repl.co/play?query=${encodeURIComponent(q)}`);
        return res.data?.result?.url || null;
      },
      async q => {
        let res = await axios.get(`https://api-v1.fgplay.repl.co/play?query=${encodeURIComponent(q)}`);
        return res.data?.result?.url || null;
      },
      async q => {
        let res = await axios.get(`https://api-v1.shadowapi.repl.co/song?query=${encodeURIComponent(q)}`);
        return res.data?.result?.url || null;
      },
      async q => {
        let res = await axios.get(`https://api-v1.streamapi.repl.co/play?query=${encodeURIComponent(q)}`);
        return res.data?.result?.url || null;
      },
      async q => {
        let res = await axios.get(`https://api-v1.cloudapi.repl.co/play?query=${encodeURIComponent(q)}`);
        return res.data?.result?.url || null;
      },
      // Additional APIs can be added here
    ];

    let success = false;

    for (let i = 0; i < apis.length; i++) {
      try {
        let url = await apis[i](query);
        if (!url) continue;

        console.log(`Trying API ${i + 1}:`, url);

        // Now fetch the actual MP3 buffer
        const audio = await axios.get(url, { responseType: "arraybuffer", timeout: 30000 });
        if (audio.status === 200 && audio.data) {
          await sock.sendMessage(chat, {
            audio: audio.data,
            mimetype: "audio/mpeg",
            fileName: `${query}.mp3`
          }, { quoted: m });

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
        text: "❌ All attempts failed—no song found. Try another name or YouTube link."
      }, { quoted: m });
    }
  }
};
