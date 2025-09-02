const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "soundcloud",
    command: ["sc", "soundcloud"],
    description: "Download full SoundCloud songs (link or search term)",

    async execute(sock, m, args) {
        const jid = m.key.remoteJid;
        if (!args.length) {
            return await sock.sendMessage(
                jid,
                { text: "⚠️ Provide a SoundCloud link or song name!" },
                { quoted: m }
            );
        }

        const query = args.join(" ");
        const tempFile = path.join("/tmp", `${Date.now()}.mp3`);

        await sock.sendMessage(jid, { text: "🎶 Fetching audio, please wait..." }, { quoted: m });

        // If not a URL, search on SoundCloud
        const source = query.startsWith("http") ? query : `scsearch1:${query}`;

        // yt-dlp must use -o template for file name
        exec(`yt-dlp -x --audio-format mp3 -o "${tempFile}" "${source}"`, async (err) => {
            if (err) {
                console.error("yt-dlp error:", err);
                return await sock.sendMessage(
                    jid,
                    { text: "❌ Failed to fetch audio. Try another song or link." },
                    { quoted: m }
                );
            }

            try {
                await sock.sendMessage(
                    jid,
                    {
                        audio: fs.createReadStream(tempFile),
                        mimetype: "audio/mpeg"
                    },
                    { quoted: m }
                );

                fs.unlinkSync(tempFile); // cleanup
            } catch (e) {
                console.error("Send error:", e);
                await sock.sendMessage(
                    jid,
                    { text: "⚠️ Error while sending audio." },
                    { quoted: m }
                );
            }
        });
    }
};
