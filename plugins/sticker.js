const { Sticker, StickerTypes } = require("wa-sticker-formatter");

function randomPackName() {
    const packs = [
        "🔥 SOURAV_MD Pack",
        "💎 SOURAV_MD Stickers",
        "⚡ Made by SOURAV_MD",
        "✨ SOURAV_MD Creations",
        "👑 SOURAV_MD Exclusive"
    ];
    return packs[Math.floor(Math.random() * packs.length)];
}

module.exports = {
    name: "sticker",
    command: ["sticker", "s", "st"],
    execute: async (sock, m, args) => {
        try {
            // Get quoted or direct media
            const quoted =
                m.message?.imageMessage ||
                m.message?.videoMessage ||
                m.quoted?.message?.imageMessage ||
                m.quoted?.message?.videoMessage;

            // If user sends only text and no media
            if (!quoted) {
                return sock.sendMessage(
                    m.key.remoteJid,
                    { text: "❌ Send/Reply to an *image/video (max 10s)* or just drop media to make sticker!" },
                    { quoted: m }
                );
            }

            // Download media (direct or quoted)
            const buffer = await sock.downloadMediaMessage(
                m.message.imageMessage ? m :
                m.message.videoMessage ? m :
                m.quoted
            );

            if (!buffer) {
                return sock.sendMessage(
                    m.key.remoteJid,
                    { text: "❌ Couldn't download media. Try again." },
                    { quoted: m }
                );
            }

            // Sticker build
            const sticker = new Sticker(buffer, {
                pack: randomPackName(),
                author: "SOURAV_MD 💎",
                type: StickerTypes.FULL,
                quality: 85,
                categories: ["🤖", "🔥", "🎭"],
            });

            const stickerBuffer = await sticker.build();

            // Send sticker
            await sock.sendMessage(
                m.key.remoteJid,
                { sticker: stickerBuffer },
                { quoted: m }
            );

        } catch (err) {
            console.error("Sticker command error:", err);
            sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Sticker creation failed. Try again!" },
                { quoted: m }
            );
        }
    }
};
