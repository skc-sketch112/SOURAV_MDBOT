const { downloadMediaMessage } = require("@whiskeysockets/baileys");

module.exports = {
    name: "sticker",
    command: ["sticker", "s"],
    description: "Convert image/video to sticker",

    async execute(sock, m, args) {
        try {
            // check direct or quoted media
            const msg =
                m.message?.imageMessage ||
                m.message?.videoMessage ||
                m.quoted?.message?.imageMessage ||
                m.quoted?.message?.videoMessage;

            if (!msg) {
                return await sock.sendMessage(
                    m.key.remoteJid,
                    { text: "⚠️ Send or reply to an *image/video (max 10s)* with `.sticker`" },
                    { quoted: m }
                );
            }

            // download
            const buffer = await downloadMediaMessage(
                m.quoted ? m.quoted : m,
                "buffer",
                {},
                { logger: undefined, reuploadRequest: sock.updateMediaMessage }
            );

            if (!buffer) {
                return await sock.sendMessage(
                    m.key.remoteJid,
                    { text: "❌ Failed to download media, try again!" },
                    { quoted: m }
                );
            }

            // send sticker
            await sock.sendMessage(
                m.key.remoteJid,
                { sticker: buffer },
                { quoted: m }
            );

        } catch (err) {
            console.error("Sticker Error:", err);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: `❌ Sticker failed: ${err.message}` },
                { quoted: m }
            );
        }
    }
};
