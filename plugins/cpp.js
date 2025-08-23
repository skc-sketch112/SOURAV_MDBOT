const axios = require("axios");

module.exports = {
  name: "cpp",
  command: ["cpp"],
  description: "Pro Edition - Anime Couple/Emotions (Unlimited with Fallback)",

  async execute(sock, m, args) {
    const sender = m.key.remoteJid;

    // Categories
    const categories = [
      "hug", "kiss", "pat", "cuddle", "handhold", 
      "smile", "blush", "cry", "dance", "love"
    ];

    // Show list
    if (!args[0] || args[0].toLowerCase() === "list") {
      let menu = "💖 *Couple / Emotions Pro Edition*\n\n";
      menu += "📌 Usage: `.cpp <category>`\n\n";
      menu += "✨ *Categories:*\n" + categories.join(", ") + "\n\n";
      menu += "🔗 Example:\n.cpp hug\n";
      return sock.sendMessage(sender, { text: menu });
    }

    const choice = args[0].toLowerCase();
    if (!categories.includes(choice)) {
      return sock.sendMessage(sender, { text: `❌ Invalid category.\nType: .cpp list` });
    }

    // Fallback APIs for each category
    const apiPool = {
      hug: [
        `https://nekos.best/api/v2/hug`,
        `https://api.waifu.pics/sfw/hug`
      ],
      kiss: [
        `https://nekos.best/api/v2/kiss`,
        `https://api.waifu.pics/sfw/kiss`
      ],
      pat: [
        `https://nekos.best/api/v2/pat`,
        `https://api.waifu.pics/sfw/pat`
      ],
      cuddle: [
        `https://nekos.best/api/v2/cuddle`,
        `https://api.waifu.pics/sfw/cuddle`
      ],
      handhold: [
        `https://api.waifu.pics/sfw/handhold`
      ],
      smile: [
        `https://nekos.best/api/v2/smile`
      ],
      blush: [
        `https://nekos.best/api/v2/blush`
      ],
      cry: [
        `https://nekos.best/api/v2/cry`
      ],
      dance: [
        `https://nekos.best/api/v2/dance`
      ],
      love: [
        `https://nekos.best/api/v2/kiss`,
        `https://api.waifu.pics/sfw/kiss`
      ]
    };

    // Function to fetch image with fallback
    async function fetchImage(apiList) {
      for (let url of apiList) {
        try {
          const res = await axios.get(url);
          // Handle different API response formats
          if (res.data?.results?.[0]?.url) {
            return res.data.results[0].url;
          } else if (res.data?.url) {
            return res.data.url;
          }
        } catch (err) {
          console.error("API failed:", url, err.message);
          continue;
        }
      }
      return null;
    }

    // Get image
    const imgUrl = await fetchImage(apiPool[choice]);
    if (!imgUrl) {
      return sock.sendMessage(sender, { text: "⚠️ All sources failed. Try again later." });
    }

    // Send image
    await sock.sendMessage(sender, {
      image: { url: imgUrl },
      caption: `💞 *${choice.toUpperCase()}*`
    }, { quoted: m });
  }
};
