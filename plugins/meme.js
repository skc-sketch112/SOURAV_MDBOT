const fetch = require("node-fetch");

module.exports = {
  name: "meme",
  command: ["meme", "randommeme"],
  description: "Send random memes from Reddit (unlimited)",

  async execute(sock, msg, args) {
    try {
      const jid = msg.key.remoteJid;
      const subReddits = ["memes", "dankmemes", "wholesomememes", "me_irl", "funny"];
      const randomSub = subReddits[Math.floor(Math.random() * subReddits.length)];

      // ===== OPTION A: Reddit API with User-Agent =====
      const url = `https://www.reddit.com/r/${randomSub}/top.json?limit=50&t=day`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; WhatsAppBot/1.0; +https://github.com/yourbot)"
        }
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const posts = json.data.children.filter(
        p => p.data.post_hint === "image" && !p.data.over_18
      );
      if (!posts.length) throw new Error("No memes found.");

      const randomPost = posts[Math.floor(Math.random() * posts.length)];
      const memeUrl = randomPost.data.url;
      const title = randomPost.data.title;

      await sock.sendMessage(jid, {
        image: { url: memeUrl },
        caption: `🤣 *${title}*\n\n🌍 from r/${randomSub}`
      }, { quoted: msg });

    } catch (e) {
      console.error("Meme error:", e.message);

      // ===== OPTION B: Meme API fallback =====
      try {
        const res = await fetch("https://meme-api.com/gimme");
        const json = await res.json();

        await sock.sendMessage(msg.key.remoteJid, {
          image: { url: json.url },
          caption: `🤣 *${json.title}*\n\n🌍 from r/${json.subreddit}`
        }, { quoted: msg });

      } catch (err2) {
        console.error("Meme API error:", err2.message);
        await sock.sendMessage(msg.key.remoteJid, {
          text: "⚠️ Couldn’t fetch meme. Try again later."
        }, { quoted: msg });
      }
    }
  }
};
