const googleTTS = require("google-tts-api")

module.exports = {
    name: "tts",
    description: "Convert text to speech",
    execute: async (sock, msg, sender, args) => {
        try {
            if (!args[0]) {
                await sock.sendMessage(sender, { text: "❌ Please provide text.\n\nExample: `.tts Hello world`" })
                return
            }

            const text = args.join(" ")
            const url = googleTTS.getAudioUrl(text, {
                lang: "en", // 🌍 Change language code if needed (hi, bn, es, etc.)
                slow: false,
                host: "https://translate.google.com",
            })

            await sock.sendMessage(sender, {
                audio: { url: url },
                mimetype: "audio/mp4",
                ptt: true, // 🎤 Sends as voice note
            })
        } catch (e) {
            console.error("TTS Error:", e)
            await sock.sendMessage(sender, { text: "❌ Failed to generate speech." })
        }
    }
}
