const playdl = require("play-dl");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "song",
    command: ["song", "play"], // Supports .song and .play
    description: "Download and send a song from YouTube as an MP3.",

    async execute(sock, m, args) {
        const jid = m.key.remoteJid;
        console.log(`[Song] Received command: ${m.body} from ${jid}`);

        if (!args[0]) {
            return sock.sendMessage(
                jid,
                { text: "❌ দয়া করে একটি গানের নাম বা URL দিন।\nউদাহরণ: `.song despacito` বা `.song https://www.youtube.com/watch?v=kJQP7kiw5Fk`" },
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
                    return sock.sendMessage(jid, { text: "❌ আপনার কুয়েরির জন্য কোন ফলাফল পাওয়া যায়নি।" }, { quoted: m });
                }
                url = searchResults.videos[0].url;
                console.log(`[Song] Selected: ${searchResults.videos[0].title} (${url})`);
            }

            // Notify user
            await sock.sendMessage(
                jid,
                { text: `🎶 *${query}* ডাউনলোড হচ্ছে...\n⏳ দয়া করে অপেক্ষা করুন...` },
                { quoted: m }
            );

            // Download with retry logic
            let downloaded = false;
            let attempts = 0;
            const maxAttempts = 2;

            while (attempts < maxAttempts && !downloaded) {
                try {
                    if (playdl.is_expired()) await playdl.refreshToken();
                    const stream = await playdl.stream(url, { quality: 2 }); // Highest audio quality

                    const writer = fs.createWriteStream(outFile);
                    stream.stream.pipe(writer);

                    await new Promise((resolve, reject) => {
                        writer.on("finish", resolve);
                        writer.on("error", reject);
                    });
                    downloaded = true;
                    console.log(`[Song] Downloaded: ${outFile}`);
                } catch (err) {
                    console.error(`[Song] Attempt ${attempts + 1} failed: ${err.message}`);
                    attempts++;
                    if (attempts < maxAttempts) {
                        console.log("[Song] Retrying...");
                        await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay
                    } else {
                        throw new Error(`Download failed after ${maxAttempts} attempts: ${err.message}`);
                    }
                }
            }

            // Verify file
            if (!fs.existsSync(outFile) || fs.statSync(outFile).size === 0) {
                throw new Error("Downloaded audio file is missing or empty.");
            }

            // Get video title
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
                { text: `❌ গান প্রক্রিয়া করতে ব্যর্থ।\nকারণ: ${err.message}\nঅন্য গানের নাম বা URL চেষ্টা করুন।` },
                { quoted: m }
            );
        }
    }
};
