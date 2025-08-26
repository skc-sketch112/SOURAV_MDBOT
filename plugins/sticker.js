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
            // 🟢 Priority 1: message media
            let mediaMessage =
                m.message?.imageMessage ||
                m.message?.videoMessage;

            // 🟢 Priority 2: quoted (reply) media
            if (!mediaMessage && m.quoted) {
                mediaMessage =
                    m.quoted.message?.imageMessage ||
                    m.quoted.message?.videoMessage;
            }

            // যদি কিছুই detect না হয়
            if (!mediaMessage) {
                return sock.sendMessage(
                    m.key.remoteJid,
                    { text: "❌ Reply an *image/video (max 10s)* or send one with `.sticker`!" },
                    { quoted: m }
                );
            }

            // 🟢 buffer download (reply দিলে m.quoted, নাহলে m)
            const buffer = await sock.downloadMediaMessage(
                mediaMessage === (m.message?.imageMessage || m.message?.videoMessage) ? m : m.quoted
            );

            if (!buffer) {
                return sock.sendMessage(
                    m.key.remoteJid,
                    { text: "⚠️ Could not download media, try again!" },
                    { quoted: m }
                );
            }

            // 🟢 Sticker বানানো
            const sticker = new Sticker(buffer, {
                pack: randomPackName(),
                author: "SOURAV_MD 💎",
                type: StickerTypes.FULL,
                quality: 85,
            });

            const stickerBuffer = await sticker.build();

            await sock.sendMessage(m.key.remoteJid, { sticker: stickerBuffer }, { quoted: m });

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
