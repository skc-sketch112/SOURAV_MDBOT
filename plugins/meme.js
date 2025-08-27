const fetch = require("node-fetch");

module.exports = {
  name: "meme",
  command: ["meme", "randommeme"],
  description: "Send random memes from Reddit (unlimited)",

  async execute(sock, msg, args) {
    try {
      const subReddits = ["memes", "dankmemes", "wholesomememes", "me_irl", "funny"];
      const randomSub = subReddits[Math.floor(Math.random() * subReddits.length)];
      const url = `https://www.reddit.com/r/${randomSub}/top.json?limit=50&t=day`;

      const res = await fetch(url, { headers: { "User-Agent": "WhatsAppBot/1.0" } });
      const json = await res.json();

      const posts = json.data.children.filter(p => !p.data.over_18 && p.data.post_hint === "image");
      if (!posts.length) throw new Error("No memes found");

      const randomPost = posts[Math.floor(Math.random() * posts.length)];
      const memeUrl = randomPost.data.url;
      const title = randomPost.data.title;

      await sock.sendMessage(msg.key.remoteJid, {
        image: { url: memeUrl },
        caption: `🤣 *${title}*\n\n🌍 from r/${randomSub}`
      }, { quoted: msg });

    } catch (e) {
      console.error("Meme error:", e);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "⚠️ Couldn’t fetch meme, try again!"
      }, { quoted: msg });
    }
  }
};
