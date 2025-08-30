const axios = require("axios");

module.exports = {
  name: "wallpaper",
  alias: ["wp", "wall"],
  desc: "Get unlimited realistic wallpapers (3 per command, multi-API, no API key)",
  category: "fun",
  usage: ".wallpaper <query>",
  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;
    const query = args.join(" ") || "realistic nature";

    // 🌐 Free & keyless APIs
    const apis = [
      `https://loremflickr.com/1024/1024/${encodeURIComponent(query)}`,
      `https://random.imagecdn.app/1024/1024?${encodeURIComponent(query)}`,
      `https://source.unsplash.com/1024x1024/?${encodeURIComponent(query)}`,
      `https://picsum.photos/1024/1024?random=${Math.floor(Math.random() * 1000)}`,
      `https://dummyimage.com/1024x1024/000/fff&text=${encodeURIComponent(query)}`,
      `https://api.waifu.pics/sfw/waifu`, // anime styled, fallback
      `https://nekobot.xyz/api/image?type=wallpaper`,
      `https://api.dicebear.com/7.x/shapes/png?seed=${encodeURIComponent(query)}`,
      `https://placekitten.com/1024/1024`, // kitten wallpaper fallback
      `https://placebear.com/1024/1024` // bear wallpaper fallback
    ];

    let success = false;

    for (let api of apis) {
      try {
        let urls = [];

        if (api.includes("nekobot")) {
          const res = await axios.get(api);
          urls = [res.data.message];
        } else if (api.includes("waifu")) {
          const res = await axios.get(api);
          urls = [res.data.url];
        } else {
          urls = [api]; // direct image API
        }

        if (urls.length > 0) {
          success = true;
          for (let i = 0; i < Math.min(3, urls.length); i++) {
            await sock.sendMessage(
              jid,
              {
                image: { url: urls[i] },
                caption: `📸 Wallpaper Result ${i + 1} for *${query}*`
              },
              { quoted: msg }
            );
          }
          break;
        }
      } catch (err) {
        console.log(`❌ Failed from API: ${api} | ${err.message}`);
        continue; // try next API
      }
    }

    if (!success) {
      await sock.sendMessage(
        jid,
        { text: "⚠️ All wallpaper APIs failed. Try again later." },
        { quoted: msg }
      );
    }
  }
};
