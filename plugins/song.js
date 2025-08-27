// song.js - Advanced YouTube Audio Downloader Plugin using @bochilteam/scraper
const { youtube } = require("@bochilteam/scraper");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "song",
  command: ["song", "play", "music"],
  description: "Download and send MP3 audio from YouTube using scraper.",

  async execute(sock, m, args, { axios, fetch }) {
    const jid = m.key.remoteJid;
    console.log(`[Song] Command received: ${m.body} from ${jid}`);

    if (!args[0]) {
      return sock.sendMessage(jid, { text: "❌ দয়া করে গানের নাম বা YouTube URL দিন।\nউদাহরণ: `.song despacito` বা `.song https://www.youtube.com/watch?v=kJQP7kiw5Fk`" }, { quoted: m });
    }

    const query = args.join(" ");
    try {
      // Search using scraper
      const searchResults = await youtube(query, { limit: 5 }); // Get 5 results for fallback
      if (!searchResults.length) {
        return sock.sendMessage(jid, { text: "❌ কোন ফলাফল পাওয়া যায়নি।" }, { quoted: m });
      }

      let audioUrl = searchResults[0].audio[0].url;
      let title = searchResults[0].title || "Unknown Title";
      let attempt = 0;
      const maxAttempts = searchResults.length;

      while (attempt < maxAttempts) {
        try {
          console.log(`[Song] Attempting download from: ${audioUrl}`);
          // Notify user
          await sock.sendMessage(jid, { text: `🎶 *${title}* ডাউনলোড হচ্ছে...\n⏳ দয়া করে অপেক্ষা করুন...` }, { quoted: m });

          // Create downloads folder
          const downloadsDir = path.join(__dirname, "../downloads");
          if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });
          const outFile = path.join(downloadsDir, `${Date.now()}.mp3`);

          // Download MP3
          const response = await axios({
            url: audioUrl,
            method: "GET",
            responseType: "stream",
            timeout: 60000 // 60-second timeout
          });

          const writer = response.data.pipe(fs.createWriteStream(outFile));

          await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
          });

          // Verify file
          if (!fs.existsSync(outFile) || fs.statSync(outFile).size === 0) {
            throw new Error("Downloaded audio file is missing or empty.");
          }

          // Send MP3
          await sock.sendMessage(jid, {
            audio: { url: outFile },
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`
          }, { quoted: m });

          // Clean up
          fs.unlinkSync(outFile);
          console.log(`[Song] Cleaned up: ${outFile}`);
          return; // Success
        } catch (err) {
          console.error(`[Song] Download attempt ${attempt + 1} failed: ${err.message}`);
          attempt++;
          if (attempt < maxAttempts) {
            audioUrl = searchResults[attempt].audio[0].url;
            title = searchResults[attempt].title;
          } else {
            throw new Error("All download attempts failed.");
          }
        }
      }
    } catch (err) {
      console.error("[Song Error]:", err.message);
      await sock.sendMessage(jid, { text: `❌ গান প্রক্রিয়া করতে ব্যর্থ।\nকারণ: ${err.message}\nঅন্য গানের নাম বা URL চেষ্টা করুন।` }, { quoted: m });
    }
  }
};
