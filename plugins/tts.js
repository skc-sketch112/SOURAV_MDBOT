const googleTTS = require("google-tts-api");

module.exports = {
    name: "tts",
    description: "Convert text to speech",
    execute: async (sock, msg, args) => {
        try {
            if (!args.length) {
                await sock.sendMessage(msg.key.remoteJid, { text: "❌ Please provide text. Example: *.tts hello*" });
                return;
            }

            const text = args.join(" ");
            const url = googleTTS.getAudioUrl(text, {
                lang: "en",
                slow: false,
                host: "https://translate.google.com",
            });

            await sock.sendMessage(msg.key.remoteJid, {
                audio: { url: url },
                mimetype: "audio/mp4"
            });
        } catch (err) {
            console.error("TTS Error:", err);
            await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Failed to generate speech." });
        }
    }
};
