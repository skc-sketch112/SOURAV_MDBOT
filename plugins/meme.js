const fetch = require("node-fetch");

module.exports = {
  name: "meme",
  command: ["meme", "randommeme"],
  description: "Send random memes (supports multiple memes)",

  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;
    let count = parseInt(args[0]) || 1;  // default = 1 meme
    if (count > 10) count = 10; // safety limit

    try {
      for (let i = 0; i < count; i++) {
        const res = await fetch("https://meme-api.com/gimme");
        if (!res.ok) throw new Error(`API returned ${res.status}`);

        const json = await res.json();
        if (!json.url) throw new Error("No meme found");

        await sock.sendMessage(jid, {
          image: { url: json.url },
          caption: `🤣 *${json.title}*\n\n🌍 from r/${json.subreddit}`
        }, { quoted: msg });
      }
    } catch (e) {
      console.error("Meme error:", e.message);
      await sock.sendMessage(jid, {
        text: "⚠️ Couldn’t fetch meme(s). Try again later!"
      }, { quoted: msg });
    }
  }
};
