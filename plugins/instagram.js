const axios = require("axios");

module.exports = {
  name: "instagram",
  alias: ["ig", "insta"],
  desc: "Download Instagram Video/Reel",
  type: "downloader",

  async exec(m, { sock, args }) {
    try {
      if (!args[0]) {
        return await sock.sendMessage(
          m.chat,
          { text: "⚠️ Please provide an Instagram link!\nExample: .instagram https://www.instagram.com/reel/xxxx" },
          { quoted: m }
        );
      }

      let url = args[0].split("?")[0]; // clean link
      let api = `https://vihangayt.me/download/instagram?url=${encodeURIComponent(url)}`;

      let { data } = await axios.get(api);

      if (!data || !data.data || !data.data.data) {
        return await sock.sendMessage(m.chat, { text: "❌ Failed to fetch Instagram media." }, { quoted: m });
      }

      let mediaList = data.data.data;

      for (let media of mediaList) {
        if (media.type === "video") {
          await sock.sendMessage(m.chat, {
            video: { url: media.url },
            caption: "✅ Instagram Video Downloaded"
          }, { quoted: m });
        } else if (media.type === "image") {
          await sock.sendMessage(m.chat, {
            image: { url: media.url },
            caption: "✅ Instagram Image Downloaded"
          }, { quoted: m });
        }
      }

    } catch (err) {
      console.error("Instagram Error:", err.message);
      await sock.sendMessage(m.chat, { text: "❌ Error fetching Instagram media." }, { quoted: m });
    }
  }
};
