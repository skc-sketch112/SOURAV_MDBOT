// gif.js
// Usage: .gif love | .gif dance | .gif cat

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "gif",
    command: ["gif"],
    description: "Fetch unlimited GIFs based on a search term (e.g., .gif love).",

    async execute(sock, m, args) {
        const jid = m.key.remoteJid;

        // Parse args properly
        if (!args || args.length === 0) {
            const body = m.message?.conversation || m.message?.extendedTextMessage?.text || "";
            args = body.trim().split(" ").slice(1);
        }

        if (!args[0]) {
            return sock.sendMessage(
                jid,
                { text: "❌ Please provide a search term.\nExample: `.gif love`" },
                { quoted: m }
            );
        }

        const query = args.join(" ");
        console.log(`[GIF] Searching for: ${query}`);

        // ✅ Your API keys (hardcoded)
        const TENOR_API_KEY = "pAK5zzINaq0FCJohPglEe54LdFDKn4gm";
        const GIPHY_API_KEY = "AIzaSyCFAmB6jViQ-DFBJQB6PXa8IVJ1GOyHGiw";

        const downloadsDir = path.join(__dirname, "../downloads");
        if (!fs.existsSync(downloadsDir)) {
            fs.mkdirSync(downloadsDir, { recursive: true });
        }

        const outFile = path.join(downloadsDir, `${Date.now()}.mp4`);
        let gifUrl;

        try {
            // Notify user
            await sock.sendMessage(
                jid,
                { text: `🎥 Searching for *${query}* GIFs...\n⏳ Please wait...` },
                { quoted: m }
            );

            // 🔹 Try Tenor first
            try {
                console.log("[GIF] Trying Tenor API...");
                const tenorRes = await axios.get("https://tenor.googleapis.com/v2/search", {
                    params: {
                        q: query,
                        key: TENOR_API_KEY, // ✅ fixed
                        limit: 10,
                        media_filter: "gif"
                    }
                });
                const results = tenorRes.data.results;
                if (!results || results.length === 0) throw new Error("No results on Tenor.");
                const randomGif = results[Math.floor(Math.random() * results.length)];
                gifUrl = randomGif.media_formats.mp4?.url || randomGif.media_formats.gif?.url;
                console.log(`[GIF] Tenor URL: ${gifUrl}`);
            } catch (tenorError) {
                console.error("[GIF] Tenor failed:", tenorError.message);

                // 🔹 Fallback to Giphy
                console.log("[GIF] Trying Giphy API...");
                const giphyRes = await axios.get("https://api.giphy.com/v1/gifs/search", {
                    params: {
                        q: query,
                        api_key: GIPHY_API_KEY, // ✅ fixed
                        limit: 10,
                        rating: "pg"
                    }
                });
                const results = giphyRes.data.data;
                if (!results || results.length === 0) throw new Error("No results on Giphy.");
                const randomGif = results[Math.floor(Math.random() * results.length)];
                gifUrl = randomGif.images.original.mp4 || randomGif.images.original.url;
                console.log(`[GIF] Giphy URL: ${gifUrl}`);
            }

            if (!gifUrl) throw new Error("No valid GIF URL found.");

            // 🔹 Download GIF/MP4
            const response = await axios({
                url: gifUrl,
                method: "GET",
                responseType: "stream"
            });

            const writer = fs.createWriteStream(outFile);
            response.data.pipe(writer);
            await new Promise((res, rej) => {
                writer.on("finish", res);
                writer.on("error", rej);
            });

            // Send as video (autoplay like GIF)
            await sock.sendMessage(
                jid,
                {
                    video: { url: outFile },
                    mimetype: "video/mp4",
                    caption: `✨ Here’s your *${query}* GIF!`
                },
                { quoted: m }
            );

            // Cleanup
            fs.unlinkSync(outFile);
            console.log(`[GIF] Sent and deleted: ${outFile}`);
        } catch (err) {
            console.error("[GIF] Error:", err.message);
            await sock.sendMessage(
                jid,
                { text: `❌ Failed to fetch GIF.\nError: ${err.message}` },
                { quoted: m }
            );
        }
    }
};
