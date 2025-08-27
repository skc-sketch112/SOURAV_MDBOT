const youtubedl = require("youtube-dl-exec");
const playdl = require("play-dl");
const yts = require("yt-search");
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
                { text: "❌ Please provide a song name or URL.\nExample: `.song despacito` or `.song https://www.youtube.com/watch?v=kJQP7kiw5Fk`" },
                { quoted: m }
            );
        }

        const query = args.join(" ");
        console.log(`[Song] Processing query: ${query}`);

        try {
            // Create downloads folder
            const downloadsDir = path.join(__dirname, "../downloads");
            if (!fs.existsSync(downloadsDir)) {
                fs.mkdirSync(downloadsDir, { recursive: true });
            }

            const outFile = path.join(downloadsDir, `${Date.now()}.mp3`);

            // Determine if query is URL or search term
            let url;
            if (query.startsWith("http://") || query.startsWith("https://")) {
                url = query;
            } else {
                console.log(`[Song] Searching for: ${query}`);
                const searchResults = await yts(query);
                if (!searchResults.videos || searchResults.videos.length === 0) {
                    return sock.sendMessage(jid, { text: "❌ No results found for your query." }, { quoted: m });
                }
                url = searchResults.videos[0].url;
                console.log(`[Song] Selected: ${searchResults.videos[0].title} (${url})`);
            }

            // Notify user
            await sock.sendMessage(
                jid,
                { text: `🎶 Downloading song...\n⏳ Please wait (this may take a few seconds)...` },
                { quoted: m }
            );

            // Try youtube-dl-exec first
            let downloaded = false;
            try {
                console.log("[Song] Trying youtube-dl-exec");
                await youtubedl(url, {
                    extractAudio: true,
                    audioFormat: "mp3",
                    output: outFile,
                    audioQuality: 0, // Best quality
                    noCheckCertificate: true,
                    timeout: 300000 // 5-minute timeout
                });
                downloaded = true;
                console.log(`[Song] Downloaded with youtube-dl-exec: ${outFile}`);
            } catch (ytdlError) {
                console.error("[Song] youtube-dl-exec Error:", ytdlError.message);
            }

            // Fallback to play-dl if youtube-dl-exec fails
            if (!downloaded) {
                console.log("[Song] Falling back to play-dl");
                if (playdl.is_expired()) await playdl.refreshToken();
                const stream = await playdl.stream(url, { quality: 2 }); // Highest audio quality

                // Save stream to file
                const writer = fs.createWriteStream(outFile);
                stream.stream.pipe(writer);

                await new Promise((resolve, reject) => {
                    writer.on("finish", resolve);
                    writer.on("error", reject);
                });
                console.log(`[Song] Downloaded with play-dl: ${outFile}`);
            }

            // Verify file
            if (!fs.existsSync(outFile) || fs.statSync(outFile).size === 0) {
                throw new Error("Downloaded audio file is missing or empty.");
            }

            // Get video title for filename
            const videoInfo = await yts({ videoId: url.split("v=")[1] || url });
            const title = videoInfo.title || "song";

            // Send audio
            await sock.sendMessage(
                jid,
                {
                    audio: { url: outFile },
                    mimetype: "audio/mpeg",
                    fileName: `${title}.mp3`
                },
                { quoted: m }
            );

            // Clean up
            fs.unlinkSync(outFile);
            console.log(`[Song] Cleaned up: ${outFile}`);
        } catch (err) {
            console.error("[Song] Error:", err.message);
            await sock.sendMessage(
                jid,
                { text: `❌ Failed to process song.\nError: ${err.message}\nTry a different song name or URL.` },
                { quoted: m }
            );
        }
    }
};
