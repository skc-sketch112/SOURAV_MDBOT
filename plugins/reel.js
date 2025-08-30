const fetch = require("node-fetch");

module.exports = {
  name: "reel",
  alias: ["funnyreel", "lolreel", "snapreel"],
  desc: "Get random funny reels (Instagram/Snapchat/TikTok style)",
  category: "fun",
  usage: ".reel",
  async execute(sock, m, args) {
    try {
      // 🔥 10+ APIs for unlimited reels/memes/videos
      const apis = [
        // TikTok funny reels proxy
        "https://api.ryzendesu.vip/api/tiktok?query=funny",
        // TikTok random trending
        "https://api.ryzendesu.vip/api/tiktok?query=trending",
        // YouTube short (proxy downloader)
        "https://api.ryzendesu.vip/api/ytmp4?url=https://www.youtube.com/shorts/J0U9dV0y6Bw",
        // Popcat meme API (sometimes gives videos/gifs)
        "https://api.popcat.xyz/meme",
        // Random meme API
        "https://meme-api.com/gimme",
        // Random Reddit short funny videos
        "https://meme-api.com/gimme/funny",
        // Doggo funny vids (proxy)
        "https://random.dog/woof.json",
        // Cat funny vids (proxy)
        "https://aws.random.cat/meow",
        // Duck API (sometimes gifs/videos)
        "https://random-d.uk/api/v2/random",
        // JokesAPI (gives funny media sometimes)
        "https://v2.jokeapi.dev/joke/Any?format=txt",
        // Reddit proxy (r/shorts)
        "https://meme-api.com/gimme/ProgrammerHumor",
        // Fallback: public random video link
        "https://nekobot.xyz/api/image?type=gif"
      ];

      let videoUrl = null;

      // 🔄 Loop through all APIs until one gives video/mp4
      for (const api of apis) {
        try {
          const res = await fetch(api);
          if (!res.ok) continue;

          const data = await res.json().catch(() => null);

          if (!data) continue;

          // Normalize possible keys
          if (data.video) videoUrl = data.video;
          else if (data.url && (data.url.endsWith(".mp4") || data.url.includes("http"))) videoUrl = data.url;
          else if (data.link && data.link.includes("http")) videoUrl = data.link;
          else if (data.file && data.file.includes("http")) videoUrl = data.file;

          if (videoUrl) break;
        } catch (err) {
          continue;
        }
      }

      if (!videoUrl) {
        return sock.sendMessage(m.key.remoteJid, {
          text: "⚠️ Couldn’t fetch any reel right now, try again!"
        }, { quoted: m });
      }

      await sock.sendMessage(m.key.remoteJid, {
        video: { url: videoUrl },
        caption: "😂 Here’s a random funny reel for you!"
      }, { quoted: m });

    } catch (err) {
      console.error(err);
      sock.sendMessage(m.key.remoteJid, {
        text: "❌ Error fetching funny reel."
      }, { quoted: m });
    }
  }
};
