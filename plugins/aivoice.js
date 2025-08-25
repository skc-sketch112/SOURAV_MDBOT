const fs = require("fs");
const path = require("path");
const axios = require("axios");

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY; // put your API key in Render "Environment"

module.exports = {
    name: "aivoice",
    command: ["aivoice", "say", "voice"],
    execute: async (sock, m, args) => {
        if (!args[0]) {
            return sock.sendMessage(m.key.remoteJid, { text: "❌ Provide text. Example: .aivoice Hello world" }, { quoted: m });
        }

        // List of 20+ voices (you can replace with ElevenLabs official voice IDs)
        const voices = [
            "Rachel", "Domi", "Bella", "Antoni", "Elli", "Josh", "Arnold", "Adam", "Sam",
            "Emily", "Brian", "Grace", "Liam", "Sophia", "Mia", "Ethan", "Olivia", "Daniel", "Ava", "Lucas", "Isabella"
        ];

        // List of 20+ effects (tone/emotion styles)
        const effects = [
            "default", "cheerful", "angry", "sad", "excited", "whisper", "robotic", "deep", "childlike", "shouting",
            "calm", "serious", "fast", "slow", "dreamy", "ghostly", "echo", "alien", "cute", "monster"
        ];

        let text = args.slice(1).join(" ") || "Hello, this is an AI voice demo!";
        let voiceChoice = voices[Math.floor(Math.random() * voices.length)];
        let effectChoice = effects[Math.floor(Math.random() * effects.length)];

        try {
            const response = await axios({
                method: "POST",
                url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceChoice}`,
                headers: {
                    "xi-api-key": ELEVENLABS_API_KEY,
                    "Content-Type": "application/json"
                },
                data: {
                    text,
                    model_id: "eleven_multilingual_v2",
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.8,
                        style: effectChoice, // chosen effect
                    }
                },
                responseType: "arraybuffer",
            });

            const filePath = path.join(__dirname, "aivoice.mp3");
            fs.writeFileSync(filePath, Buffer.from(response.data), "binary");

            await sock.sendMessage(
                m.key.remoteJid,
                { audio: { url: filePath }, mimetype: "audio/mpeg", ptt: false },
                { quoted: m }
            );

        } catch (e) {
            console.error("AI Voice Error:", e.message);
            await sock.sendMessage(m.key.remoteJid, { text: "❌ Voice generation failed!" }, { quoted: m });
        }
    }
};
