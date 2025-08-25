// plugins/aivoice.js
const gTTS = require("google-tts-api");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

module.exports = {
  command: ["aivoice", "echo", "voice", "ttspro"],
  description: "Convert text into AI voice with 20+ voices & 20+ effects",

  async handler(sock, m, args) {
    let text = args.join(" ").trim();
    if (!text) {
      return sock.sendMessage(
        m.chat,
        { text: "🎙️ Usage: *!aivoice <voice> <effect> <text>*\nExample: !aivoice en-us echo Hello world" },
        { quoted: m }
      );
    }

    try {
      // ----- VOICES -----
      const voices = {
        "en-us": "English US",
        "en-uk": "English UK",
        "hi": "Hindi",
        "es": "Spanish",
        "fr": "French",
        "de": "German",
        "it": "Italian",
        "ja": "Japanese",
        "ko": "Korean",
        "ru": "Russian",
        "pt": "Portuguese",
        "ar": "Arabic",
        "zh": "Chinese",
        "id": "Indonesian",
        "bn": "Bengali",
        "ta": "Tamil",
        "te": "Telugu",
        "tr": "Turkish",
        "th": "Thai",
        "ms": "Malay",
      };

      // ----- EFFECTS -----
      const effects = {
        normal: "",
        echo: "aecho 0.8 0.9 1000 0.3",
        reverb: "reverb",
        robot: "overdrive 20",
        chipmunk: "pitch 700",
        deep: "pitch -400",
        bassboost: "bass +10",
        radio: "highpass 200 lowpass 3000",
        telephone: "bandpass 1000 200",
        cave: "reverb 50 50 100",
        vaporwave: "speed 0.8 pitch -300",
        nightcore: "speed 1.25 pitch 400",
        tremolo: "tremolo 5 0.6",
        flanger: "flanger",
        chorus: "chorus 0.7 0.9 55 0.4 0.25 2 -t",
        alien: "pitch 1200",
        demon: "pitch -800",
        megaphone: "highpass 1000 gain -6",
        whisper: "vol 0.5 treble -6",
        distortion: "overdrive 30",
      };

      let selectedVoice = "en-us";
      let selectedEffect = "normal";

      // check if first arg is voice
      if (voices[args[0]?.toLowerCase()]) {
        selectedVoice = args[0].toLowerCase();
        args.shift();
      }

      // check if next arg is effect
      if (effects[args[0]?.toLowerCase()]) {
        selectedEffect = args[0].toLowerCase();
        args.shift();
      }

      text = args.join(" ").trim();
      if (!text) return sock.sendMessage(m.chat, { text: "❌ Please provide text." }, { quoted: m });

      // ----- Generate TTS -----
      const url = gTTS.getAudioUrl(text, {
        lang: selectedVoice.split("-")[0],
        slow: false,
        host: "https://translate.google.com",
      });

      const tmpDir = path.join(__dirname, "../tmp");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

      const rawFile = path.join(tmpDir, `voice_${Date.now()}.mp3`);
      const finalFile = path.join(tmpDir, `voice_fx_${Date.now()}.mp3`);

      const res = await fetch(url);
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(rawFile, buffer);

      // ----- Apply Effect (if not normal) -----
      if (effects[selectedEffect] !== "") {
        await new Promise((resolve, reject) => {
          exec(`ffmpeg -i "${rawFile}" -af "${effects[selectedEffect]}" "${finalFile}"`, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      } else {
        fs.copyFileSync(rawFile, finalFile);
      }

      // Send audio back
      await sock.sendMessage(
        m.chat,
        {
          audio: fs.readFileSync(finalFile),
          mimetype: "audio/mpeg",
          ptt: true,
        },
        { quoted: m }
      );

      fs.unlinkSync(rawFile);
      fs.unlinkSync(finalFile);
    } catch (err) {
      console.error("AI Voice Error:", err);
      await sock.sendMessage(m.chat, { text: "⚠️ AI Voice failed. Try again." }, { quoted: m });
    }
  },
};
