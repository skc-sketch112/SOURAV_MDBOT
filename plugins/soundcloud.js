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
            return await sock.sendMessage(jid, { text: "⚠️ Provide a SoundCloud link or song name!" }, { quoted: m });
        }

        const query = args.join(" ");
        const output = path.join(__dirname, `${Date.now()}.mp3`);

        // Show initial loader
        await sock.sendMessage(jid, { text: "🎶 Fetching audio, please wait..." }, { quoted: m });

        // If not a URL, search on SoundCloud (yt-dlp can handle `scsearch1:`)
        const source = query.startsWith("http") ? query : `scsearch1:${query}`;

        // Run yt-dlp to download
        exec(`yt-dlp -x --audio-format mp3 -o "${output}" "${source}"`, async (err) => {
            if (err) {
                console.error("yt-dlp error:", err);
                return await sock.sendMessage(jid, { text: "❌ Failed to fetch audio. Try another song or link." }, { quoted: m });
            }

            try {
                await sock.sendMessage(jid, {
                    audio: fs.createReadStream(output),
                    mimetype: "audio/mpeg"
                }, { quoted: m });

                fs.unlinkSync(output); // cleanup
            } catch (e) {
                console.error("Send error:", e);
                await sock.sendMessage(jid, { text: "⚠️ Error while sending audio." }, { quoted: m });
            }
        });
    }
};
