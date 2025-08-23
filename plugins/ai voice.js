const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "voice",
  command: ["voice"], // ⬅️ only .voice command now
  description: "AI Voice Generator with 20+ voices + cinematic effects.",

  async execute(sock, m, args) {
    const sender = m.key.remoteJid;
    let text = args.join(" ");

    // === Voices ===
    const voiceStyles = {
      male: "male",
      female: "female",
      deepmale: "deep_male",
      softfemale: "soft_female",
      anime: "anime_girl",
      whisper: "whisper",
      robot: "robotic",
      narrator: "narrator",
      child: "child",
      angry: "angry",
      calm: "calm",
      ghost: "ghost",
      alloy: "alloy",
      wave: "wave",
      happy: "happy",
      sad: "sad",
      scary: "scary",
      oldman: "old_man",
      queen: "queen"
    };

    // === Effects (optional) ===
    const effects = {
      echo: "echo",
      reverb: "reverb",
      rain: "rain",
      space: "space",
      bass: "bass_boost"
    };

    // === Menu ===
    if (!text) {
      let menu = "🎙️ *AI Voice Generator (Pro Edition)*\n\n";
      menu += "📌 *Usage:* `.voice <voice> [effect] <text>`\n\n";
      menu += "🎭 *Voices:*\n" + Object.keys(voiceStyles).join(", ") + "\n\n";
      menu += "✨ *Effects:*\n" + Object.keys(effects).join(", ") + "\n\n";
      menu += "🔗 Example:\n.voice anime echo Hello master!";
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
      return sock.sendMessage(sender, { text: "❌ Please provide text after voice/effect.\nExample: `.voice anime echo Hello!`" });
    }

    // === Generate Voice ===
    async function generateVoice(q, v) {
      try {
        // HuggingFace AI Voice
        const pollUrl = `https://api-inference.huggingface.co/models/facebook/mms-tts-${v}`;
        const res = await axios.post(pollUrl, { inputs: q }, {
          headers: { "Authorization": "Bearer hf_fake_token" }, // replace with real token
          responseType: "arraybuffer"
        });
        return Buffer.from(res.data, "binary");
      } catch {}

      try {
        // Backup: Google Translate TTS
        const gUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encodeURIComponent(q)}&tl=en`;
        const res = await axios.get(gUrl, { responseType: "arraybuffer" });
        return Buffer.from(res.data, "binary");
      } catch {}

      return null;
    }

    // === Fake FX Processor (placeholder for ffmpeg) ===
    function applyEffect(buffer, fx) {
      if (!fx) return buffer;
      return buffer;
    }

    // === Handle Long Text
