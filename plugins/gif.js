const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "gif",
  command: ["gif"],
  description: "Fetch 3–5 GIFs for any word (love, dance, cat, sad, etc.) without API keys.",

  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    if (!args[0]) {
      return sock.sendMessage(
        jid,
        { text: "❌ Usage: .gif <word>\nExample: .gif love" },
        { quoted: m }
      );
    }

    const query = args.join(" ").toLowerCase();
    console.log(`[GIF] Searching for: ${query}`);

    let gifUrls = [];

    // 🔹 Step 1: Mapping for actions (nekos.best / waifu.pics)
    const actionMap = {
      dance: "dance",
      hug: "hug",
      kiss: "kiss",
      wink: "wink",
      cry: "cry",
      pat: "pat",
      smile: "smile",
      angry: "slap",
      sad: "cry",
      happy: "smile",
      love: "kiss",
    };

    try {
      // Try Nekos.best (returns multiple)
      if (actionMap[query]) {
        console.log("[GIF] Trying Nekos.best...");
        const res = await axios.get(`https://nekos.best/api/v2/${actionMap[query]}?amount=5`);
        if (res.data.results?.length > 0) {
          gifUrls = res.data.results.map(r => r.url);
        }
      }

      // Try Waifu.pics fallback (only 1 at a time, fetch 3 manually)
      if (gifUrls.length === 0 && actionMap[query]) {
        console.log("[GIF] Trying Waifu.pics...");
        for (let i = 0; i < 3; i++) {
          const res = await axios.get(`https://api.waifu.pics/sfw/${actionMap[query]}`);
          gifUrls.push(res.data.url);
        }
      }

      // 🔹 Step 2: If no mapped action, try Reddit memes (gives many results)
      if (gifUrls.length === 0) {
        console.log("[GIF] Trying Reddit (meme API)...");
        const res = await axios.get(`https://meme-api.com/gimme/${query}/5`);
        if (res.data.memes?.length > 0) {
          gifUrls = res.data.memes.map(m => m.url);
        } else if (res.data.url) {
          gifUrls.push(res.data.url);
        }
      }

      if (gifUrls.length === 0) throw new Error("No GIFs found");

      // 🔹 Step 3: Download & send multiple GIFs
      for (const gifUrl of gifUrls.slice(0, 5)) {
        try {
          const downloadsDir = path.join(__dirname, "../downloads");
          if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });
          const outFile = path.join(downloadsDir, `${Date.now()}_${Math.random()}.mp4`);

          const response = await axios({ url: gifUrl, method: "GET", responseType: "stream" });
          const writer = fs.createWriteStream(outFile);
          response.data.pipe(writer);

          await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
          });

          await sock.sendMessage(
            jid,
            {
              video: { url: outFile },
              mimetype: "video/mp4",
              caption: `✨ *${query}* GIF`
            },
            { quoted: m }
          );

          fs.unlinkSync(outFile);
        } catch (err) {
          console.error("[GIF] Failed one URL:", gifUrl, err.message);
        }
      }

      console.log(`[GIF] Sent ${gifUrls.length} GIFs for query: ${query}`);
    } catch (err) {
      console.error("[GIF] Error:", err.message);
      await sock.sendMessage(jid, { text: "❌ Failed to fetch GIFs." }, { quoted: m });
    }
  }
};
