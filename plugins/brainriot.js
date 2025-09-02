module.exports = {
    name: "brainrot",
    command: ["brainrot", "br", "randomsound"],
    description: "Send fully random Brainrot audio (direct links).",

    async execute(sock, m) {
        const jid = m.key.remoteJid;

        // ===== Loader animation =====
        const loaderFrames = [
            "🌀 Loading Brainrot 0%",
            "🌀 Loading Brainrot 25%",
            "🌀 Loading Brainrot 50%",
            "🌀 Loading Brainrot 75%",
            "🌀 Loading Brainrot 100% 🔥"
        ];

        for (let frame of loaderFrames) {
            await sock.sendMessage(jid, { text: frame });
            await new Promise(r => setTimeout(r, 400));
        }

        try {
            // ===== Brainrot audio links =====
            const clips = [
                "https://example.com/brainrot1.mp3",
                "https://example.com/brainrot2.mp3",
                "https://example.com/brainrot3.mp3",
                "https://example.com/brainrot4.mp3",
                "https://example.com/brainrot5.mp3",
                "https://example.com/brainrot6.mp3"
                // add more links as you like
            ];

            // ===== Pick 3–5 random clips =====
            const numClips = Math.floor(Math.random() * 3) + 3;
            for (let i = 0; i < numClips; i++) {
                const randomClip = clips[Math.floor(Math.random() * clips.length)];

                await sock.sendMessage(jid, {
                    audio: { url: randomClip },
                    mimetype: "audio/mpeg",
                    ptt: false
                }, { quoted: m });

                await new Promise(r => setTimeout(r, 400));
            }

            await sock.sendMessage(jid, { text: "🎉 Brainrot chaos delivered! Powered by SOURAV_MD 🔥" });

        } catch (err) {
            console.error("Brainrot plugin error:", err.message);
            await sock.sendMessage(jid, { text: `❌ Brainrot failed: ${err.message}` }, { quoted: m });
        }
    }
};
