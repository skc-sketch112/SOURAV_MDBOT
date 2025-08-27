const fetch = require("node-fetch");

module.exports = {
  name: "meme",
  command: ["meme", "randommeme"],
  description: "Send random memes from Reddit (unlimited)",

  async execute(sock, msg, args) {
    try {
      const apiSub = args[0] || "";  // Optionally allow subreddit argument
      const endpoint = apiSub
        ? `https://memesapi.vercel.app/give/${apiSub}`
        : `https://memesapi.vercel.app/give`;

      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const memeData = json.memes && json.memes[0];
      if (!memeData || !memeData.url) {
        throw new Error("No meme found");
      }

      await sock.sendMessage(msg.key.remoteJid, {
        image: { url: memeData.url },
        caption: `🤣 *${memeData.title}*\n\n🌍 from r/${memeData.subreddit}`
      }, { quoted: msg });

    } catch (e) {
      console.error("Meme error:", e);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "⚠️ Couldn’t fetch meme, try again!"
      }, { quoted: msg });
    }
  }
};
