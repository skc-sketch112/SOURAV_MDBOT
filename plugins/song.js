const { execFile } = require("child_process");
const yts = require("yt-search");
const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "song",
    command: ["song"], // Ensures .song is the trigger
    description: "Download and send a song from YouTube as an MP3 file.",

    async execute(sock, m, args) {
        const jid = m.key.remoteJid;
        if (!args[0]) {
            return sock.sendMessage(
                jid,
                { text: "❌ Please provide a song name.\nExample: `.song despacito`" },
                { quoted: m }
            );
        }

        const query = args.join(" ");
        try {
            // 🔍 Search YouTube
            console.log(`[Song] Searching for: ${query}`);
            const search = await yts(query);
            if (!search.videos || search.videos.length === 0) {
                return sock.sendMessage(jid, { text: "❌ No results found for your query." }, { quoted: m });
            }

            const video = search.videos[0]; // Best match
            const url = video.url;
            console.log(`[Song] Selected video: ${video.title} (${url})`);

            // Create downloads folder if it doesn't exist
            const downloadsDir = path.join(__dirname, "../downloads");
            if (!fs.existsSync(downloadsDir)) {
                fs.mkdirSync(downloadsDir, { recursive: true });
            }

            const outFile = path.join(downloadsDir, `${Date.now()}.mp3`);

            // Notify user
            await sock.sendMessage(
                jid,
                { text: `🎶 Downloading *${video.title}*...\n⏳ Please wait (this may take a few seconds)...` },
                { quoted: m }
            );

            // ⚡ Try yt-dlp first
            const ytDlpPath = path.join(__dirname, "../yt-dlp");
            if (!fs.existsSync(ytDlpPath)) {
                console.error("[Song] yt-dlp binary not found at:", ytDlpPath);
                return sock.sendMessage(
                    jid,
                    { text: "❌ Error: yt-dlp binary not found. Contact the bot administrator." },
                    { quoted: m }
                );
            }

            // Ensure yt-dlp is executable
            fs.chmodSync(ytDlpPath, "755");

            try {
                await new Promise((resolve, reject) => {
                    execFile(
                        ytDlpPath,
                        [
                            "-x",
                            "--audio-format", "mp3",
                            "--audio-quality", "0", // Best quality
                            "-o", outFile,
                            url
                        ],
                        { timeout: 300000 }, // 5-minute timeout
                        (error, stdout, stderr) => {
                            if (error) {
                                console.error("[Song] yt-dlp error:", error.message, stderr);
                                reject(error);
                            } else {
                                console.log("[Song] yt-dlp output:", stdout);
                                resolve();
                            }
                        }
                    );
                });

                // Verify file exists and is not empty
                if (!fs.existsSync(outFile) || fs.statSync(outFile).size === 0) {
                    throw new Error("Downloaded file is missing or empty.");
                }

                // ✅ Send song to WhatsApp
                await sock.sendMessage(
                    jid,
                    {
                        audio: { url: outFile },
                        mimetype: "audio/mpeg",
                        fileName: `${video.title}.mp3`
                    },
                    { quoted: m }
                );

                // Clean up
                fs.unlinkSync(outFile);
            } catch (ytDlpError) {
                console.error("[Song] yt-dlp failed, trying ytdl-core fallback:", ytDlpError.message);
                // Fallback to ytdl-core
                const stream = ytdl(url, {
                    filter: "audioonly",
                    quality: "highestaudio"
                });
                const writeStream = fs.createWriteStream(outFile);
                stream.pipe(writeStream);

                await new Promise((resolve, reject) => {
                    writeStream.on("finish", resolve);
                    writeStream.on("error", reject);
                });

                if (!fs.existsSync(outFile) || fs.statSync(outFile).size === 0) {
                    throw new Error("Fallback download failed or file is empty.");
                }

                // ✅ Send song to WhatsApp
                await sock.sendMessage(
                    jid,
                    {
                        audio: { url: outFile },
                        mimetype: "audio/mpeg",
                        fileName: `${video.title}.mp3`
                    },
                    { quoted: m }
                );

                // Clean up
                fs.unlinkSync(outFile);
            }
        } catch (err) {
            console.error("[Song] Unexpected error:", err.message);
            await sock.sendMessage(
                jid,
                { text: `❌ Failed to process song.\nError: ${err.message}\nPlease try again later or use a different song name.` },
                { quoted: m }
            );
        }
    }
};
