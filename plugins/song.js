const { execFile } = require("child_process");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "song",
    command: ["song"],
    execute: async (sock, m, args) => {
        if (!args[0]) {
            return sock.sendMessage(m.key.remoteJid, { text: "❌ Please provide a song name.\nExample: `.song despacito`" }, { quoted: m });
        }

        const query = args.join(" ");
        try {
            // 🔍 Search YouTube for the song
            const search = await yts(query);
            if (!search.videos || search.videos.length === 0) {
                return sock.sendMessage(m.key.remoteJid, { text: "❌ No results found." }, { quoted: m });
            }

            const video = search.videos[0]; // Take first result
            const url = video.url;
            const outFile = path.join(__dirname, `../downloads/${Date.now()}.mp3`);

            // Make sure downloads folder exists
            if (!fs.existsSync(path.join(__dirname, "../downloads"))) {
                fs.mkdirSync(path.join(__dirname, "../downloads"));
            }

            sock.sendMessage(m.key.remoteJid, { text: `🎶 Downloading *${video.title}*...\n⏳ Please wait...` }, { quoted: m });

            // ⚡ Use local yt-dlp binary
            execFile(
                path.join(__dirname, "../yt-dlp"),
                [
                    "-x",
                    "--audio-format", "mp3",
                    "-o", outFile,
                    url
                ],
                (error, stdout, stderr) => {
                    if (error) {
                        console.error("yt-dlp error:", error);
                        return sock.sendMessage(m.key.remoteJid, { text: "❌ Failed to download audio. Try again later." }, { quoted: m });
                    }

                    // Send audio to WhatsApp
                    sock.sendMessage(
                        m.key.remoteJid,
                        {
                            audio: { url: outFile },
                            mimetype: "audio/mpeg",
                            fileName: `${video.title}.mp3`
                        },
                        { quoted: m }
                    ).then(() => {
                        fs.unlinkSync(outFile); // delete after sending
                    });
                }
            );
        } catch (err) {
            console.error("Song command error:", err
