const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

module.exports = {
  name: "voice",
  command: ["voice"],
  description: "AI Voice Generator Pro (multi-voices + effects)",

  async execute(sock, m, args) {
    const sender = m.key.remoteJid;
    let text = args.join(" ");

    // === Voices (styles) ===
    const voiceStyles = {
      male: "male",
      female: "female",
      anime: "anime_girl",
      narrator: "narrator",
      child: "child",
      oldman: "old_man",
      queen: "queen"
    };

    // === Effects (processed by ffmpeg) ===
    const effects = {
      robot: "atempo=1,asetrate=44100*0.7,afftfilt=real='hypot(re,im)':imag='0'",
      echo: "aecho=0.8:0.9:1000:0.3",
      reverb: "aecho=0.8:0.9:2000:0.5",
      scary: "asetrate=44100*0.6,atempo=1.2",
      bass: "bass=g=10",
      chipmunk: "asetrate=44100*1.5,atempo=1.2",
      deep: "asetrate=44100*0.6,atempo=1.0"
    };

    // === LIST ===
    if (!text || text.toLowerCase() === "list") {
      let menu = "🎙️ *AI Voice Generator - Pro Edition*\n\n";
      menu += "📌 Usage: `.voice <voice> [effect] <text>`\n\n";
      menu += "🎭 *Voices:*\n" + Object.keys(voiceStyles).join(", ") + "\n\n";
      menu += "✨ *Effects:*\n" + Object.keys(effects).join(", ") + "\n\n";
      menu += "🔗 Example:\n.voice anime robot Hello Master!\n";
      return sock.sendMessage(sender, { text: menu });
    }

    // === Parse Command ===
    let voice = "female";
    let effect = null;

    if (voiceStyles[args[0]]) {
      voice = voiceStyles[args[0]];
      args.shift();
    }
    if (effects[args[0]]) {
      effect = effects[args[0]];
      args.shift();
    }
    text = args.join(" ");

    if (!text) {
      return sock.sendMessage(sender, { text: "❌ Please provide text.\nExample: `.voice anime echo Hello!`" });
    }

    // === Generate TTS ===
    async function generateVoice(q, v) {
      try {
        const pollUrl = `https://api-inference.huggingface.co/models/facebook/mms-tts-${v}`;
        const res = await axios.post(pollUrl, { inputs: q }, {
          headers: { "Authorization": "Bearer hf_fake_token" }, // replace with real token
          responseType: "arraybuffer"
        });
        return Buffer.from(res.data, "binary");
      } catch {}

      try {
        const gUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encodeURIComponent(q)}&tl=en`;
        const res = await axios.get(gUrl, { responseType: "arraybuffer" });
        return Buffer.from(res.data, "binary");
      } catch {}

      return null;
    }

    // === Process text in chunks ===
    const chunks = text.match(/.{1,200}/g);

    for (let i = 0; i < chunks.length; i++) {
      const audioBuffer = await generateVoice(chunks[i], voice);
      if (!audioBuffer) {
        return sock.sendMessage(sender, { text: "⚠️ Voice generation failed. Try again later." });
      }

      // Save raw voice
      const rawFile = path.join(__dirname, `raw_${Date.now()}.mp3`);
      fs.writeFileSync(rawFile, audioBuffer);

      let finalFile = rawFile;

      // Apply effect with ffmpeg
      if (effect) {
        const outFile = path.join(__dirname, `voice_${Date.now()}.mp3`);
        try {
          execSync(`ffmpeg -y -i "${rawFile}" -af "${effect}" "${outFile}"`);
          finalFile = outFile;
        } catch (err) {
          console.error("FFmpeg error:", err);
        }
      }

      // Send result
      await sock.sendMessage(sender, {
        audio: { url: finalFile },
        mimetype: "audio/mpeg",
        ptt: false
      }, { quoted: m });

      fs.unlinkSync(rawFile);
      if (finalFile !== rawFile) fs.unlinkSync(finalFile);
    }
  }
};
