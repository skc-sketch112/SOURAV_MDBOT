const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const ytdl = require("youtube-dl-exec");

module.exports = {
  name: "song",
  alias: ["music"],
  desc: "Download songs (JioSaavn > SoundCloud > YouTube fallback)",
  category: "media",
  async execute(sock, m, args) {
    try {
      if (!args[0]) {
        return await sock.sendMessage(m.chat, { text: "🎵 Example: .song kesariya" }, { quoted: m });
      }

      const query = args.join(" ");
      let audioUrl = null;
      let title = query;

      // 1️⃣ JioSaavn
      try {
        let res = await fetch(`https://jiosaavn-api.vercel.app/search/songs?query=${encodeURIComponent(query)}`);
        let data = await res.json();
        if (data.data && data.data.length > 0) {
          let song = data.data[0];
          audioUrl = song.downloadUrl[song.downloadUrl.length - 1].link;
          title = song.title;
        }
      } catch (e) {}

      // 2️⃣ SoundCloud
      if (!audioUrl) {
        try {
          let res = await fetch(`https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(query)}&client_id=2t9loNQH90kzJcsFCODdigxfp325aq4z`);
          let data = await res.json();
          if (data.collection && data.collection.length > 0) {
            audioUrl = data.collection[0].media.transcodings[0].url + `?client_id=2t9loNQH90kzJcsFCODdigxfp325aq4z`;
            title = data.collection[0].title;
          }
        } catch (e) {}
      }

      // 3️⃣ YouTube fallback
      if (!audioUrl) {
        const tmpFile = path.join(__dirname, "song.mp3");
        await ytdl(`ytsearch:${query}`, {
          extractAudio: true,
          audioFormat: "mp3",
          audioQuality: "0",
          output: tmpFile,
          noCheckCertificates: true,
          noWarnings
