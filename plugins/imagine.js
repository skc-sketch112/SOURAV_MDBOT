const axios = require("axios");

module.exports = {
  name: "imagine",
  command: ["imagine", "aiimg", "dream", "imagine2", "imagine3", "imagine4"],
  description: "Generate AI images (art, realistic, anime, random)",

  async execute(sock, m, args, command) {
    try {
      const sender = m.key.remoteJid;
      const prompt = args.join(" ");

      // Help menu
      if (args[0] && args[0].toLowerCase() === "list") {
        return sock.sendMessage(sender, {
          text:
            `✨ *Imagine Modes Available* ✨\n\n` +
            `1️⃣ .imagine <prompt> → 🎨 AI Art Style\n` +
            `2️⃣ .imagine2 <prompt> → 📸 Realistic Style\n` +
            `3️⃣ .imagine3 <prompt> → 🎌 Anime Style\n` +
            `4️⃣ .imagine4 <prompt> → 🎲 Random Style\n\n` +
            `👉 Example:\n.imagine dragon in sky\n.imagine2 Messi lifting trophy\n.imagine3 Naruto vs Sasuke\n.imagine4 sunset beach`
        });
      }

      if (!prompt) {
        return sock.sendMessage(sender, {
          text: "⚡ Provide a prompt!\n\nUse `.imagine list` to see all modes."
        });
      }

      // Helper: send image with caption
      const sendImage = async (url, caption) => {
        await sock.sendMessage(sender, {
          image: { url },
          caption
        });
      };

      // 🌐 Fallback fetcher
      const fetchImage = async (urls) => {
        for (let u of urls) {
          try {
            return await axios.get(u), u; // check if link works
          } catch (e) {
            continue; // try next
          }
        }
        return null;
      };

      // 🎨 ART MODE
      if (["imagine", "aiimg", "dream"].includes(command)) {
        const urls = [
          `https://lexica.art/api/v1/search?q=${encodeURIComponent(prompt)}`,
          `https://image.pollinations.ai/prompt/${encodeURIComponent("art " + prompt)}`
        ];

        try {
          const res = await axios.get(urls[0]);
          if (res.data.images?.length) {
            for (let img of res.data.images.slice(0, 2)) {
              await sendImage(img.src, `🎨 *AI Imagine (Art)*\n📝 ${prompt}`);
            }
            return;
          }
        } catch {}
        await sendImage(urls[1], `🎨 *AI Imagine (Art Fallback)*\n📝 ${prompt}`);
      }

      // 📸 REALISTIC MODE
      if (command === "imagine2") {
        const urls = [
          `https://image.pollinations.ai/prompt/${encodeURIComponent("realistic " + prompt)}`,
          `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(prompt)}`
        ];
        const working = await fetchImage(urls);
        if (working) return sendImage(working[1], `📸 *AI Imagine (Realistic)*\n📝 ${prompt}`);
      }

      // 🎌 ANIME MODE
      if (command === "imagine3") {
        const urls = [
          `https://image.pollinations.ai/prompt/anime ${encodeURIComponent(prompt)}`,
          `https://api.waifu.pics/sfw/waifu`
        ];
        try {
          const res = await axios.get(urls[1]);
          if (res.data?.url) {
            return sendImage(res.data.url, `🎌 *AI Imagine (Anime)*\n📝 ${prompt}`);
          }
        } catch {}
        return sendImage(urls[0], `🎌 *AI Imagine (Anime)*\n📝 ${prompt}`);
      }

      // 🎲 RANDOM MODE
      if (command === "imagine4") {
        const modes = ["imagine", "imagine2", "imagine3"];
        const pick = modes[Math.floor(Math.random() * modes.length)];
        return module.exports.execute(sock, m, args, pick);
      }

    } catch (err) {
      console.error("❌ Imagine error:", err);
      return sock.sendMessage(m.key.remoteJid, {
        text: "⚠️ Failed to generate AI image. Try again later."
      });
    }
  }
};
