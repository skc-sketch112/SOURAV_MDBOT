const axios = require("axios");

async function safeFetch(url, type = "json") {
  try {
    const res = await axios.get(url, { timeout: 15000 });
    return type === "json" ? res.data : url;
  } catch (e) {
    return null;
  }
}

module.exports = {
  name: "imagine",
  command: ["imagine", "imagine2", "imagine3", "imagine4"],
  description: "AI Image Generator (Art, Realistic, Anime, Random)",

  async execute(sock, m, args, command) {
    const sender = m.key.remoteJid;
    const prompt = args.join(" ");

    if (!prompt) {
      return sock.sendMessage(sender, {
        text:
          "✨ *AI Imagine Modes*\n\n" +
          "1️⃣ `.imagine <text>` 🎨 Art Style\n" +
          "2️⃣ `.imagine2 <text>` 📸 Realistic Style\n" +
          "3️⃣ `.imagine3 <text>` 🎌 Anime Style\n" +
          "4️⃣ `.imagine4 <text>` 🎲 Random Style\n\n" +
          "👉 Example: `.imagine dragon flying over ocean`"
      });
    }

    // Helper to send images
    const sendImage = async (url, caption) => {
      await sock.sendMessage(sender, { image: { url }, caption });
    };

    // === 🌐 API SOURCES ===
    const sources = {
      art: [
        (p) => `https://image.pollinations.ai/prompt/art ${encodeURIComponent(p)}`,
        async (p) => {
          let res = await safeFetch(`https://lexica.art/api/v1/search?q=${encodeURIComponent(p)}`);
          if (res?.images?.length) return res.images[0].src;
          return null;
        }
      ],
      realistic: [
        (p) => `https://image.pollinations.ai/prompt/realistic ${encodeURIComponent(p)}`,
        (p) => `https://api.dicebear.com/7.x/adventurer/png?seed=${encodeURIComponent(p)}`
      ],
      anime: [
        (p) => `https://image.pollinations.ai/prompt/anime ${encodeURIComponent(p)}`,
        async () => {
          let res = await safeFetch("https://api.waifu.pics/sfw/waifu");
          return res?.url || null;
        }
      ]
    };

    // === PICK MODE ===
    let mode = "art";
    if (command === "imagine2") mode = "realistic";
    if (command === "imagine3") mode = "anime";
    if (command === "imagine4") {
      const pick = ["art", "realistic", "anime"];
      mode = pick[Math.floor(Math.random() * pick.length)];
    }

    // === TRY SOURCES WITH FALLBACK ===
    let img = null;
    for (let src of sources[mode]) {
      try {
        let out = typeof src === "function" ? await src(prompt) : src;
        if (out) {
          img = out;
          break;
        }
      } catch {}
    }

    // === FINAL RESPONSE ===
    if (img) {
      return sendImage(img, `✨ *AI Imagine (${mode.toUpperCase()})*\n📝 ${prompt}`);
    } else {
      return sendImage(
        "https://i.ibb.co/3m9tWkd/fallback.png",
        `⚠️ All AI servers busy!\n📝 Prompt: ${prompt}`
      );
    }
  }
};
