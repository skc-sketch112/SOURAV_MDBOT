// plugins/lyrics.js
const Genius = require("genius-lyrics");
const Client = new Genius.Client(process.env.GENIUS_API_KEY); // 🔑 Get free key from genius.com

module.exports = {
  name: "lyrics",
  command: ["lyrics", "lyric", "songlyrics"],
  description: "Fetch song lyrics instantly (Bengali, Hindi, English, etc.).",

  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;

    try {
      if (!args[0]) {
        return sock.sendMessage(jid, { text: "❌ Usage: .lyrics <song name>" }, { quoted: msg });
      }

      const query = args.join(" ");
      const searches = await Client.songs.search(query);

      if (!searches.length) {
        return sock.sendMessage(jid, { text: "⚠️ No lyrics found." }, { quoted: msg });
      }

      const song = searches[0];
      const lyrics = await song.lyrics();

      await sock.sendMessage(jid, {
        text: `🎶 *${song.title}* by *${song.artist.name}*\n\n${lyrics}`
      }, { quoted: msg });

    } catch (err) {
      console.error("Lyrics Error:", err);
      await sock.sendMessage(jid, { text: "❌ Failed to fetch lyrics. Try again later." }, { quoted: msg });
    }
  }
};
