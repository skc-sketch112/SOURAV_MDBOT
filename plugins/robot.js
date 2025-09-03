const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

// ✅ OpenAI API key hardcoded
const openai = new OpenAI({
  apiKey: "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"
});

module.exports = {
  name: "robot",
  alias: ["robotvoice", "robotify"],
  desc: "Convert any text into a robot voice using OpenAI TTS",
  category: "audio",
  usage: ".robot <text>",

  async execute(sock, msg, args) {
    try {
      if (!args.length) {
        return sock.sendMessage(
          msg.key.remoteJid,
          { text: "⚠️ Usage: `.robot <text>`" },
          { quoted: msg }
        );
      }

      const text = args.join(" ");

      // Initial loader message
      const sentMsg = await sock.sendMessage(msg.key.remoteJid, {
        text: "🤖 Converting text into robot voice..."
      }, { quoted: msg });

      // Add reaction
      await sock.sendMessage(msg.key.remoteJid, {
        react: { text: "🤖", key: msg.key }
      });

      // Loader animation editing the same message
      const frames = [
        "🤖 Converting text into robot voice .",
        "🤖 Converting text into robot voice ..",
        "🤖 Converting text into robot voice ...",
        "🤖 Converting text into robot voice ...."
      ];

      for (let i = 0; i < 8; i++) {
        await new Promise(r => setTimeout(r, 400));
        await sock.sendMessage(msg.key.remoteJid, {
          edit: sentMsg.key,
          text: frames[i % frames.length]
        });
      }

      // Generate robot voice using OpenAI TTS
      const response = await openai.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice: "alloy", // robot/metallic voice
        input: text
      });

      const outputPath = path.join(__dirname, "temp_robot.mp3");
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(outputPath, buffer);

      // Send voice note editing the same message
      await sock.sendMessage(msg.key.remoteJid, {
        audio: fs.readFileSync(outputPath),
        mimetype: "audio/mpeg",
        ptt: true,
        caption: "🤖 Your text has been transformed into a robot voice!"
      }, { quoted: msg });

      // Clean temp file
      fs.unlinkSync(outputPath);

    } catch (err) {
      console.error("Robot TTS error:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Failed to convert text into robot voice."
      }, { quoted: msg });
    }
  }
};
