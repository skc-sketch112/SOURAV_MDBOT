const fetch = require("node-fetch");

module.exports = {
  name: "wallpaper",
  alias: ["wp", "wall"],
  desc: "Get unlimited realistic wallpapers",
  category: "media",
  usage: ".wallpaper <query>",
  async execute(sock, m, args) {
    try {
      if (!args[0]) {
        return sock.sendMessage(m.key.remoteJid, {
          text: "❌ Please provide a search term!\nExample: `.wallpaper nature`"
        }, { quoted: m });
      }

      const query = args.join(" ");
      const apis = [
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=landscape&per_page=10`,
        `https://pixabay.com/api/?key=51874106-2a96202d9815d07ac95dba697&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal`,
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=landscape&per_page=10&client_id=Uebb0QGhkVela_0V0ZidmqYXDqAEHRYpV2UnemVHgLY`
      ];

      let results = [];

      for (let url of apis) {
        try {
          let res;
          if (url.includes("pexels")) {
            res = await fetch(url, { headers: { Authorization: "2OHAFWxDxIbbzzfpsIx68eXOAFQ9MtWWZcrQBUoslhwRTlv3tOU6tFo5" } });
            let data = await res.json();
            data.photos.forEach(p => results.push(p.src.original));
          } else {
            res = await fetch(url);
            let data = await res.json();
            if (data.hits) {
              data.hits.forEach(p => results.push(p.largeImageURL));
            } else if (data.results) {
              data.results.forEach(p => results.push(p.urls.full));
            }
          }
        } catch (e) {
          console.error("API failed:", url, e.message);
        }
      }

      if (results.length === 0) {
        return sock.sendMessage(m.key.remoteJid, {
          text: "⚠️ No wallpapers found. Try another keyword!"
        }, { quoted: m });
      }

      // send only first 3 images to avoid spam
      let selected = results.slice(0, 3);

      for (let i = 0; i < selected.length; i++) {
        await sock.sendMessage(m.key.remoteJid, {
          image: { url: selected[i] },
          caption: `📸 Wallpaper Result ${i + 1} for *${query}*`
        }, { quoted: m });
      }

    } catch (err) {
      console.error("Wallpaper error:", err);
      await sock.sendMessage(m.key.remoteJid, { text: "❌ Error fetching wallpapers." }, { quoted: m });
    }
  }
};
