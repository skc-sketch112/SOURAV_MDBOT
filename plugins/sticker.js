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
            // 🟢 এখন থেকে reply করা image/video detect করবে
            const quotedMsg = m.quoted ? m.quoted.message : null;
            const media =
                m.message?.imageMessage ||
                m.message?.videoMessage ||
                (quotedMsg && quotedMsg.imageMessage) ||
                (quotedMsg && quotedMsg.videoMessage);

            if (!media) {
                return sock.sendMessage(
                    m.key.remoteJid,
                    { text: "❌ Reply an *image/video (max 10s)* or send one with `.sticker`!" },
                    { quoted: m }
                );
            }

            // 🟢 buffer ডাউনলোড
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

            // 🟢 Sticker বানানো
            const sticker = new Sticker(buffer, {
                pack: randomPackName(),
                author: "SOURAV_MD 💎",
                type: StickerTypes.FULL,
                quality: 85,
                categories: ["🔥","⚡","💎"],
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
