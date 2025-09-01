const fs = require("fs");
const path = require("path");
const gTTS = require("gtts");

module.exports = {
  name: "developer",
  alias: ["dev", "coder"],
  desc: "Show developer information",
  category: "general",
  usage: ".developer",
  async execute(sock, msg, args) {
    try {
      // ⚡ Motivational Developer Quotes
      const quotes = [
        "First, solve the problem. Then, write the code.",
        "Code is like humor. When you have to explain it, it’s bad.",
        "Experience is the name everyone gives to their mistakes.",
        "Fix the cause, not the symptom.",
        "Simplicity is the soul of efficiency.",
        "Before software can be reusable it first has to be usable.",
        "Make it work, make it right, make it fast.",
        "Talk is cheap. Show me the code.",
        "Don’t comment bad code, rewrite it.",
        "Code never lies, comments sometimes do.",
        "Every great developer you know got there by solving problems they were unqualified to solve until they actually did it.",
        "Programming isn’t about what you know; it’s about what you can figure out.",
        "First, learn the rules; then break them smartly.",
        "Your mind is software. Program it well.",
        "Consistency is the key to mastery.",
        "Code Hard ⚡ Rule Smart."
      ];
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

      // ⚡ Stylish Banner
      const banner = `
╔═══════════════════════╗
   💻 *BOT DEVELOPER INFO* 💻
╚═══════════════════════╝
`;

      // ⚡ Developer Info
      const info = `
┏━━━⚡ *DEVELOPER* ⚡━━━┓
┃ 👨‍💻 Name    : SOURAV
┃ 🏷️ Project : SOURAV_MD-V5
┃ 🌍 Region  : INDIAN
┃ 🛠️ Skills  : Node.js • AI • Automation
┃ 📜 Motto   : "Code Hard ⚡ Rule Smart"
┗━━━━━━━━━━━━━━━━━━━━━━━┛
`;

      // ⚡ Extra Notes
      const note = `
📩 For collaborations, ideas, or fixes —
Feel free to reach out anytime!

💡 *Quote of the Day*:
"${randomQuote}"
`;

      // Full Message
      const message = `${banner}\n${info}\n${note}`;

      // 🔹 Buttons
      const buttons = [
        {
          buttonId: ".owner",
          buttonText: { displayText: "👑 OWNER INFO" },
          type: 1,
        },
        {
          buttonId: ".menu",
          buttonText: { displayText: "📜 MAIN MENU" },
          type: 1,
        },
        {
          buttonId: "https://github.com/",
          buttonText: { displayText: "🌐 GITHUB" },
          type: 1,
        },
      ];

      // 🔹 Image support (optional)
      const mediaPath = "./media/developer.jpg";
      const devImage = fs.existsSync(path.resolve(mediaPath))
        ? { image: fs.readFileSync(path.resolve(mediaPath)) }
        : null;

      const msgOptions = devImage
        ? {
            ...devImage,
            caption: message,
            buttons,
            headerType: 4,
          }
        : {
            text: message,
            buttons,
            headerType: 1,
          };

      // Send main message
      await sock.sendMessage(msg.key.remoteJid, msgOptions, { quoted: msg });

      // 🔹 vCard Contact
      const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:SOURAV (Developer)
ORG:BOT DEVELOPER;
TEL;type=CELL;type=VOICE;waid=919476189681:+91 94761 89681
END:VCARD
      `;
      await sock.sendMessage(
        msg.key.remoteJid,
        {
          contacts: {
            displayName: "SOURAV (Developer)",
            contacts: [{ vcard }],
          },
        },
        { quoted: msg }
      );

      // 🔹 Voice Intro (TTS)
      const ttsText = "This bot is developed by SOURAV from India.";
      const outFile = "./media/developer_intro.mp3";

      const gtts = new gTTS(ttsText, "en");
      gtts.save(outFile, async function (err) {
        if (err) {
          console.error("❌ gTTS Error:", err);
        } else {
          await sock.sendMessage(
            msg.key.remoteJid,
            { audio: fs.readFileSync(outFile), mimetype: "audio/mp4", ptt: true },
            { quoted: msg }
          );
          fs.unlinkSync(outFile); // delete after sending
        }
      });

    } catch (e) {
      console.error("❌ Error in developer.js:", e);
      await sock.sendMessage(
        msg.key.remoteJid,
        { text: "⚠️ Failed to load developer info." },
        { quoted: msg }
      );
    }
  },
};
