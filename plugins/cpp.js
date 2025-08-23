const axios = require("axios");

module.exports = {
  name: "cpp",
  command: ["cpp", "couple"],
  description: "Unlimited Couple Images with error-free fallback system",

  async execute(sock, m, args) {
    const sender = m.key.remoteJid;
    const query = args.join(" ") || "couple";

    // Helper: safe fetch
    async function safeFetch(url, key) {
      try {
        const res = await axios.get(url, { timeout: 15000 });
        if (key) return res.data[key] || null;
        return res.data;
      } catch {
        return null;
      }
    }

    // Helper: send
    async function sendImage(url, cap) {
      try {
        await sock.sendMessage(sender, { image: { url }, caption: cap });
      } catch {
        await sock.sendMessage(sender, { text: "❌ Failed to send image." });
      }
    }

    // === Multiple Sources for Couple Pics ===
    const sources = [
      async (q) => {
        const res = await safeFetch(`https://lexica.art/api/v1/search?q=${encodeURIComponent(q)}`);
        if (res?.images?.length) {
          return res.images[Math.floor(Math.random() * res.images.length)].src;
        }
        return null;
      },
      async (q) => `https://source.unsplash.com/600x600/?${encodeURIComponent(q)},couple,love`,
      async () => {
        const res = await safeFetch(`https://api.waifu.pics/sfw/waifu`);
        return res?.url || null;
      },
      async (q) => {
        return `https://image.pollinations.ai/prompt/${encodeURIComponent("romantic couple " + q)}`;
      },
      async (q) => {
        const res = await safeFetch(`https://nekos.best/api/v2/neko`);
        return res?.results?.[0]?.url || null;
      },
      async (q) => {
        const res = await safeFetch(`https://api.waifu.im/search/?included_tags=waifu`);
        return res?.images?.[0]?.url || null;
      },
      async () => "https://i.ibb.co/3m9tWkd/fallback.png" // LAST fallback
    ];

    let img = null;

    // Try each source until success
    for (let src of sources) {
      try {
        img = await src(query);
        if (img) break;
      } catch {}
    }

    if (!img) {
      return sock.sendMessage(sender, { text: "⚠️ All APIs failed. Please try again later." });
    }

    // === Final Send ===
    return sendImage(img, `💞 *Couple Image* 💞\n🔍 Query: ${query}`);
  }
};
