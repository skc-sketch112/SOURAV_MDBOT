const axios = require("axios");

async function safeFetch(url) {
  try {
    const res = await axios.get(url, { timeout: 10000 });
    return res.data;
  } catch {
    return null;
  }
}

module.exports = {
  name: "cpp",
  command: ["cpp", "couple"],
  description: "Unlimited Couple Images (Error-Free)",

  async execute(sock, m, args, command) {
    const sender = m.key.remoteJid;
    const query = args.join(" ") || "couple";

    const sendImage = async (url, caption) => {
      await sock.sendMessage(sender, { image: { url }, caption });
    };

    // === Unlimited Sources ===
    const sources = [
      async (q) => {
        let res = await safeFetch(`https://lexica.art/api/v1/search?q=${encodeURIComponent(q)}`);
        if (res?.images?.length) {
          return res.images[Math.floor(Math.random() * res.images.length)].src;
        }
        return null;
      },
      async (q) => `https://source.unsplash.com/600x600/?${encodeURIComponent(q)},couple`,
      async () => {
        let res = await safeFetch(`https://api.waifu.pics/sfw/waifu`);
        return res?.url || null;
      },
      async (q) => `https://image.pollinations.ai/prompt/${encodeURIComponent(q + " couple")}`,
      async () => "https://i.ibb.co/3m9tWkd/fallback.png" // Final fallback
    ];

    let img = null;

    // Try all APIs until one works
    for (let src of sources) {
      try {
        img = await src(query);
        if (img) break;
      } catch {}
    }

    // === Final Send ===
    return sendImage(img, `💞 *Couple Mode (${query.toUpperCase()})* 💞`);
  }
};
