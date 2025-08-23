const axios = require("axios");
const FormData = require("form-data");
const cheerio = require("cheerio");

module.exports = {
  name: "logo2",
  command: ["logo2"],
  description: "Generate 20+ realistic text logos (with fallback)",

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

    // ✅ Supported styles (PhotoOxy)
    const photooxyStyles = {
      sand: "https://photooxy.com/logo-and-text-effects/writing-on-sand-277.html",
      fire: "https://photooxy.com/logo-and-text-effects/realistic-flaming-text-effect-online-197.html",
      smoke: "https://photooxy.com/other-design/create-an-easy-smoke-type-effect-390.html",
      neon: "https://photooxy.com/logo-and-text-effects/make-smoky-neon-glow-effect-343.html",
      graffiti: "https://photooxy.com/logo-and-text-effects/online-graffiti-text-generator-196.html",
      glass: "https://photooxy.com/logo-and-text-effects/make-text-in-the-sand-211.html",
      magma: "https://photooxy.com/logo-and-text-effects/hot-metal-text-effect-111.html",
      ice: "https://photooxy.com/logo-and-text-effects/ice-cold-text-effect-355.html",
      sky: "https://photooxy.com/logo-and-text-effects/cloud-text-effect-in-the-sky-360.html",
      wood: "https://photooxy.com/logo-and-text-effects/wood-text-effect-24.html",
      blood: "https://photooxy.com/logo-and-text-effects/blood-text-on-the-frosted-glass-323.html",
      gold: "https://photooxy.com/logo-and-text-effects/create-gold-text-effect-harry-potter-218.html",
      silver: "https://photooxy.com/logo-and-text-effects/silver-metallic-text-effect-246.html",
      water: "https://photooxy.com/logo-and-text-effects/drop-water-text-effect-163.html",
      stone: "https://photooxy.com/logo-and-text-effects/3d-stone-cracked-cool-text-effect-402.html",
      lava: "https://photooxy.com/logo-and-text-effects/lava-text-effect-online-914.html",
      metal: "https://photooxy.com/logo-and-text-effects/metal-dark-gold-text-effect-284.html",
      horror: "https://photooxy.com/logo-and-text-effects/horror-blood-text-online-197.html",
      glow: "https://photooxy.com/logo-and-text-effects/make-glowing-neon-light-text-effect-367.html",
      thunder: "https://photooxy.com/logo-and-text-effects/create-thunder-text-effect-online-881.html",
    };

    // ✅ TextPro fallback
    const textproStyles = {
      neon: "https://textpro.me/create-neon-light-blackpink-logo-text-effect-online-116.html",
      fire: "https://textpro.me/hot-fire-text-effect-95.html",
      magma: "https://textpro.me/create-3d-magma-hot-text-effect-online-103.html",
      ice: "https://textpro.me/ice-cold-text-effect-76.html",
      glow: "https://textpro.me/neon-text-effect-online-963.html",
    };

    // 🔥 Try PhotoOxy first
    try {
      if (photooxyStyles[style]) {
        const form = new FormData();
        form.append("text_1", text);

        const res = await axios.post(photooxyStyles[style], form, {
          headers: form.getHeaders(),
        });

        const $ = cheerio.load(res.data);
        const imgUrl = $(".thumbnail img").attr("src");

        if (imgUrl) {
          return await sock.sendMessage(
            jid,
            {
              image: { url: imgUrl.startsWith("http") ? imgUrl : "https://photooxy.com" + imgUrl },
              caption: `✨ ${style.toUpperCase()} Logo for: *${text}*`
            },
            { quoted: m }
          );
        }
      }
    } catch (err) {
      console.error("PhotoOxy failed:", err.message);
    }

    // ⚡ If PhotoOxy fails → try TextPro
    try {
      if (textproStyles[style]) {
        const res = await axios.get(
          `https://vihangayt.me/textpro?url=${encodeURIComponent(textproStyles[style])}&text=${encodeURIComponent(text)}`
        );

        if (res.data?.status && res.data.data.url) {
          return await sock.sendMessage(
            jid,
            {
              image: { url: res.data.data.url },
              caption: `✨ ${style.toUpperCase()} Logo for: *${text}*`
            },
            { quoted: m }
          );
        }
      }
    } catch (err) {
      console.error("TextPro failed:", err.message);
    }

    // 🚨 Final fallback → Unsplash (stylish random image with text overlay vibe)
    await sock.sendMessage(
      jid,
      {
        image: { url: `https://source.unsplash.com/800x400/?${encodeURIComponent(style)},${encodeURIComponent(text)}` },
        caption: `✨ Could not generate special logo, showing random style for: *${text}*`
      },
      { quoted: m }
    );
  }
};
