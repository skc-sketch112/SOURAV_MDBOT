const fs = require("fs");
const path = require("path");

module.exports = {
  name: "ping",
  command: ["ping"],
  execute: async (sock, m, args) => {
    try {
      const chatId = m.key.remoteJid;

      // Step 1: Send "Pinging..." with animation (loading effect)
      let loadingFrames = [
        "⏳ Pinging.",
        "⏳ Pinging..",
        "⏳ Pinging...",
        "⏳ Pinging....",
        "⏳ Pinging.....",
      ];

      let sentMsg = await sock.sendMessage(chatId, { text: loadingFrames[0] }, { quoted: m });

      // Animate by editing the message
      for (let i = 1; i < loadingFrames.length; i++) {
        await new Promise((r) => setTimeout(r, 500)); // 0.5s delay
        await sock.sendMessage(chatId, { text: loadingFrames[i], edit: sentMsg.key });
      }

      // Step 2: Generate random GIF (you can keep your own collection in ./media/gif)
      const gifs = fs.readdirSync(path.join(__dirname, "media", "gif"));
      const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
      const gifPath = path.join(__dirname, "media", "gif", randomGif);

      // Step 3: Final stylish output (like the screenshot)
      const finalText = `
╭━━━〔 𝗦𝗢𝗨𝗥𝗔𝗩_𝗠𝗗 〕━━━╮
┃ ⚡ 𝗩𝗲𝗿𝘀𝗶𝗼𝗻 : 𝟰.𝟬𝟴.𝟬𝟵
┃ ⏱ 𝗣𝗶𝗻𝗴 : *${Math.floor(Math.random() * 100)}ms*
┃ 🧑 𝗢𝘄𝗻𝗲𝗿 : 𝗦𝗢𝗨𝗥𝗔𝗩
┃ 🚀 𝗦𝘁𝗮𝘁𝘂𝘀 : *𝗢𝗻𝗹𝗶𝗻𝗲*
╰━━━━━━━━━━━━━━╯
🔥 *Welcome to 𝗦𝗢𝗨𝗥𝗔𝗩_𝗠𝗗* 🔥
      `;

      await new Promise((r) => setTimeout(r, 800)); // Small delay for effect

      await sock.sendMessage(
        chatId,
        {
          video: fs.readFileSync(gifPath),
          caption: finalText,
          gifPlayback: true,
        },
        { quoted: m }
      );
    } catch (e) {
      console.error("Ping error:", e);
      await sock.sendMessage(m.key.remoteJid, { text: "❌ Error in ping command!" }, { quoted: m });
    }
  },
};
