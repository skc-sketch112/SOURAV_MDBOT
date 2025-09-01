const fetch = require("node-fetch");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const gTTS = require("gtts"); // ✅ Text-to-Speech package

module.exports = {
  name: "shivpurana",
  alias: ["shivpuran", "spuran"],
  desc: "Fetch verses/slokas from Shiva Purana with audio",
  category: "religion",
  usage: ".shivpurana [random <count>] | [section <name> <count>]",
  async execute(sock, msg, args) {
    try {
      let mode = args[0] || "random";
      let count = parseInt(args[1]) || 5;
      let section = args[1] || "rudra-samhita";

      // ✅ Base URL (Wisdom Library)
      const baseURL = "https://www.wisdomlib.org/hinduism/book/shiva-purana";

      let url;
      if (mode === "random") {
        // random chapter between 1–100 approx
        const randomChap = Math.floor(Math.random() * 100) + 1;
        url = `${baseURL}/chapter/${randomChap}`;
      } else if (mode === "section") {
        url = `${baseURL}/${section}`;
      } else {
        url = `${baseURL}/chapter/1`;
      }

      // ✅ Fetch & parse HTML
      const res = await fetch(url);
      if (!res.ok) throw new Error("Website fetch failed.");
      const html = await res.text();
      const $ = cheerio.load(html);

      let paras = [];
      $("p").each((i, el) => {
        let text = $(el).text().trim();
        if (text.length > 30) paras.push(text);
      });

      if (!paras.length) {
        await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ No verses found. Try again." }, { quoted: msg });
        return;
      }

      // ✅ Limit to requested count
      const selected = paras.slice(0, count);

      // ✅ Build response text
      let reply = `📖 *Shiv Puran* 📖\n\n`;
      selected.forEach((p, i) => {
        reply += `🔹 ${i + 1}. ${p}\n\n`;
      });

      // ✅ Send text response
      await sock.sendMessage(msg.key.remoteJid, { text: reply }, { quoted: msg });

      // ✅ Convert text → voice
      const tts = new gTTS(selected.join("\n"), "en");
      const filePath = path.join(__dirname, "shivpuran.mp3");
      await new Promise((resolve, reject) => {
        tts.save(filePath, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // ✅ Send audio
      await sock.sendMessage(msg.key.remoteJid, {
        audio: fs.readFileSync(filePath),
        mimetype: "audio/mpeg",
        ptt: true
      }, { quoted: msg });

      // ✅ Delete temp file
      fs.unlinkSync(filePath);

    } catch (e) {
      console.error("❌ Shiv Puran Error:", e);
      await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Error fetching Shiva Purana." }, { quoted: msg });
    }
  }
};
