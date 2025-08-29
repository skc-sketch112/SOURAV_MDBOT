const axios = require("axios");
const fs = require("fs");
const ytdl = require("@distube/ytdl-core");
const { jidDecode } = require("@whiskeysockets/baileys");

module.exports = {
  name: "song",
  alias: ["play", "music"],
  desc: "Download songs from multiple APIs",
  category: "media",
  usage: ".song <query>",
  react: "🎶",

  start: async (client, m, { text, prefix, command }) => {
    try {
      if (!text) return client.sendMessage(m.key.remoteJid, { text: `❌ Usage: ${prefix+command} despacito` }, { quoted: m });

      const senderJid = m.key?.remoteJid || m.chat || "unknown@s.whatsapp.net";
      const senderDecoded = jidDecode(senderJid) || {};
      const user = senderDecoded.user || senderJid.split("@")[0];

      await client.sendMessage(m.chat, { text: `🔎 Searching for *${text}*... please wait` }, { quoted: m });

      // 15 API endpoints (replace with real ones you have)
      const apis = [
        `https://api1.example.com/song?query=${encodeURIComponent(text)}`,
        `https://api2.example.com/play?search=${encodeURIComponent(text)}`,
        `https://api3.example.com/music?name=${encodeURIComponent(text)}`,
        `https://api4.example.com/download?song=${encodeURIComponent(text)}`,
        `https://api5.example.com/find?track=${encodeURIComponent(text)}`,
        `https://api6.example.com/play/${encodeURIComponent(text)}`,
        `https://api7.example.com/song/${encodeURIComponent(text)}`,
        `https://api8.example.com/api?music=${encodeURIComponent(text)}`,
        `https://api9.example.com/get?song=${encodeURIComponent(text)}`,
        `https://api10.example.com/songdl?name=${encodeURIComponent(text)}`,
        `https://api11.example.com/search?audio=${encodeURIComponent(text)}`,
        `https://api12.example.com/playmusic?query=${encodeURIComponent(text)}`,
        `https://api13.example.com/downloadtrack?q=${encodeURIComponent(text)}`,
        `https://api14.example.com/musicdl?song=${encodeURIComponent(text)}`,
        `https://api15.example.com/songsearch?track=${encodeURIComponent(text)}`
      ];

      let success = false;
      for (let url of apis) {
        try {
          console.log(`🔗 Trying API: ${url}`);
          let res = await axios.get(url, { timeout: 20000 });
          
          if (!res.data || !res.data.url) throw new Error("No valid song found in response");

          let songUrl = res.data.url;

          // validate song length (not 0:00)
          if (res.data.duration && res.data.duration === "0:00") {
            console.log(`⚠️ Skipping invalid duration from ${url}`);
            continue;
          }

          const filePath = `./temp/${Date.now()}.mp3`;
          const writer = fs.createWriteStream(filePath);

          let songStream = await axios.get(songUrl, { responseType: "stream" });
          songStream.data.pipe(writer);

          await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
          });

          await client.sendMessage(
            m.chat,
            {
              audio: fs.readFileSync(filePath),
              mimetype: "audio/mpeg",
              fileName: `${text}.mp3`,
              caption: `✅ Here's your song *${text}* requested by @${user}`,
              contextInfo: { mentionedJid: [senderJid] }
            },
            { quoted: m }
          );

          fs.unlinkSync(filePath);
          success = true;
          break; // exit loop after success
        } catch (err) {
          console.error(`❌ API failed: ${url}`, err.message);
          continue; // try next API
        }
      }

      if (!success) {
        return client.sendMessage(m.chat, { text: `❌ Failed to fetch song: ${text}\nTry again later.` }, { quoted: m });
      }

    } catch (err) {
      console.error("❌ Command song error:", err);
      client.sendMessage(m.chat, { text: `❌ Error: ${err.message}` }, { quoted: m });
    }
  }
};
