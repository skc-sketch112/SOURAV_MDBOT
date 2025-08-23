const axios = require("axios");

module.exports = {
  name: "imagine",
  command: ["imagine", "aiimg", "dream", "imagine2", "imagine3", "imagine4"],
  description: "Generate AI images (art, realistic, anime, random)",

  async execute(sock, m, args, command) {
    try {
      const sender = m.key.remoteJid;
      const prompt = args.join(" ");

      // Show available modes
      if (args[0] && args[0].toLowerCase() === "list") {
        return sock.sendMessage(sender, {
          text: `✨ *Imagine Modes Available* ✨\n\n` +
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

      // ART MODE 🎨
      if (command === "imagine" || command === "aiimg" || command === "dream") {
        const url = `https://lexica.art/api/v1/search?q=${encodeURIComponent(prompt)}`;
        const res = await axios.get(url);

        if (!res.data || !res.data.images || res.data.images.length === 0) {
          return sock.sendMessage(sender, { text: "⚠️ No art results found, try another prompt!" });
        }

        const results = res.data.images.slice(0, 3);
        for (const img of results) {
          await sock.sendMessage(sender, {
            image: { url: img.src },
            caption: `🎨 *AI Imagine (Art Style)*\n📝 Prompt: ${prompt}`
          });
        }
      }

      // REALISTIC MODE 📸
      if (command === "imagine2") {
        const apiURL = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
        await sock.sendMessage(sender, {
          image: { url: apiURL },
          caption: `📸 *AI Imagine (Realistic Style)*\n📝 Prompt: ${prompt}`
        });
      }

      // ANIME MODE 🎌
      if (command === "imagine3") {
        const animeImg = `https://image.pollinations.ai/prompt/anime ${encodeURIComponent(prompt)}`;
        await sock.sendMessage(sender, {
          image: { url: animeImg },
          caption: `🎌 *AI Imagine (Anime Style)*\n📝 Prompt: ${prompt}`
        });
      }

      // RANDOM MODE 🎲
      if (command === "imagine4") {
        const styles = ["art", "realistic", "anime"];
        const pick = styles[Math.floor(Math.random() * styles.length)];

        if (pick === "art") {
          const url = `https://lexica.art/api/v1/search?q=${encodeURIComponent(prompt)}`;
          const res = await axios.get(url);
          const img = res.data.images[0];
          return sock.sendMessage(sender, {
            image: { url: img.src },
            caption: `🎲 *AI Imagine (Random → Art)*\n📝 Prompt: ${prompt}`
          });
        }

        if (pick === "realistic") {
          const apiURL = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
          return sock.sendMessage(sender, {
            image: { url: apiURL },
            caption: `🎲 *AI Imagine (Random → Realistic)*\n📝 Prompt: ${prompt}`
          });
        }

        if (pick === "anime") {
          const animeImg = `https://image.pollinations.ai/prompt/anime ${encodeURIComponent(prompt)}`;
          return sock.sendMessage(sender, {
            image: { url: animeImg },
            caption: `🎲 *AI Imagine (Random → Anime)*\n📝 Prompt: ${prompt}`
          });
        }
      }

    } catch (err) {
      console.error("❌ Imagine error:", err);
      return sock.sendMessage(m.key.remoteJid, {
        text: "⚠️ Failed to generate AI image. Try again later."
      });
    }
  }
};
