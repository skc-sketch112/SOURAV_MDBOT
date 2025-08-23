const axios = require("axios");

module.exports = {
  name: "logo2",
  command: ["logo2"],
  description: "Generate 20+ realistic text logos with API fallback",

  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    const [style, ...textArr] = args;
    const text = textArr.join(" ");

    if (!style || !text) {
      return await sock.sendMessage(
        jid,
        { text: "⚠️ Usage: `.logo2 <style> <text>`\n\nExample: `.logo2 sand Hello`" },
        { quoted: m }
      );
    }

    // ✅ List of supported styles
    const styles = {
      sand: "writing-in-sand",
      fire: "flaming-text",
      neon: "neon-light",
      smoke: "smoky-text",
      sky: "sky-text",
      wood: "wood-text",
      magma: "lava-text",
      ice: "ice-cold",
      gold: "gold-text",
      silver: "silver-metal",
      stone: "stone-text",
      blood: "blood-text",
      glow: "glow-text",
      thunder: "thunder-text",
      horror: "horror-text",
      graffiti: "graffiti-text",
      glass: "glass-text",
      water: "water-text",
      lava: "lava-text-2",
      metal: "dark-metal",
    };

    if (!styles[style]) {
      return await sock.sendMessage(
        jid,
        { text: `❌ Invalid style!\n\nAvailable: ${Object.keys(styles).join(", ")}` },
        { quoted: m }
      );
    }

    try {
      // 🔥 Using reliable API (vihangayt or similar)
      const res = await axios.get(
        `https://vihangayt.me/photooxy?text=${encodeURIComponent(text)}&effect=${encodeURIComponent(styles[style])}`
      );

      if (res.data?.status && res.data.image) {
        return await sock.sendMessage(
          jid,
          {
            image: { url: res.data.image },
            caption: `✨ ${style.toUpperCase()} Logo for: *${text}*`
          },
          { quoted: m }
        );
      } else {
        throw new Error("API returned no image");
      }
    } catch (err) {
      console.error("Logo2 error:", err.message);

      // 🚨 Final fallback → Unsplash
      await sock.sendMessage(
        jid,
        {
          image: { url: `https://source.unsplash.com/800x400/?${encodeURIComponent(style)},${encodeURIComponent(text)}` },
          caption: `⚠️ Logo API failed, showing random image for: *${text}*`
        },
        { quoted: m }
      );
    }
  }
};
