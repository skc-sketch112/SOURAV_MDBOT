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
            // Check if message has media or quoted media
            const quoted = m.message?.imageMessage || m.message?.videoMessage ||
                m.quoted?.message?.imageMessage || m.quoted?.message?.videoMessage;

            if (!quoted) {
                return sock.sendMessage(
                    m.key.remoteJid,
                    { text: "❌ Send or reply to an *image/video (max 10s)* with `.sticker` to create a sticker!" },
                    { quoted: m }
                );
            }

            // Detect type
            const buffer = await sock.downloadMediaMessage(
                m.message.imageMessage ? m :
                m.message.videoMessage ? m :
                m.quoted
            );

            if (!buffer) {
                return sock.sendMessage(
                    m.key.remoteJid,
                    { text: "❌ Failed to download media. Try again." },
                    { quoted: m }
                );
            }

            // Build sticker
            const sticker = new Sticker(buffer, {
                pack: randomPackName(),  // Random pack name each time
                author: "SOURAV_MD 💎", // Credit
                type: StickerTypes.FULL, // FULL / CROP / CIRCLE
                quality: 85,             // higher quality
                categories: ["🤖", "🔥", "🎭"], // WhatsApp categories
            });

            const stickerBuffer = await sticker.build();

            // Send sticker
            await sock.sendMessage(m.key.remoteJid, { sticker: stickerBuffer }, { quoted: m });

        } catch (err) {
            console.error("Sticker command error:", err);
            sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Oops! Sticker creation failed. Try again with a clear image/video." },
                { quoted: m }
            );
        }
    }
};
