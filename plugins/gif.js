const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "gif",
    command: ["gif"], // Ensures .gif is the trigger
    description: "Fetch unlimited GIFs based on a search term (e.g., .gif love).",

    async execute(sock, m, args) {
        const jid = m.key.remoteJid;
        if (!args[0]) {
            return sock.sendMessage(
                jid,
                { text: "❌ Please provide a search term.\nExample: `.gif love`" },
                { quoted: m }
            );
        }

        const query = args.join(" ");
        console.log(`[GIF] Searching for: ${query}`);

        // API keys (replace with your own)
        const TENOR_API_KEY = "AIzaSyCFAmB6jViQ-DFBJQB6PXa8IVJ1GOyHGiw"; // Get from https://developers.google.com/tenor/guides/quickstart
        const GIPHY_API_KEY = "YOUR_GIPHY_API_KEY"; // Get from https://developers.giphy.com/
        const downloadsDir = path.join(__dirname, "../downloads");
        const outFile = path.join(downloadsDir, `${Date.now()}.gif`);

        try {
            // Create downloads folder
            if (!fs.existsSync(downloadsDir)) {
                fs.mkdirSync(downloadsDir, { recursive: true });
            }

            // Notify user
            await sock.sendMessage(
                jid,
                { text: `🎥 Searching for *${query}* GIFs...\n⏳ Please wait...` },
                { quoted: m }
            );

            // Try Tenor API first
            let gifUrl;
            try {
                console.log("[GIF] Trying Tenor API");
                const tenorResponse = await axios.get("https://tenor.googleapis.com/v2/search", {
                    params: {
                        q: query,
                        key: TENOR_API_KEY,
                        limit: 1, // Fetch one GIF for simplicity
                        media_filter: "gif",
                        random: true // Randomize results for variety
                    }
                });
                const results = tenorResponse.data.results;
                if (!results || results.length === 0) {
                    throw new Error("No GIFs found on Tenor.");
                }
                gifUrl = results[0].media_formats.gif.url;
                console.log(`[GIF] Tenor GIF URL: ${gifUrl}`);
            } catch (tenorError) {
                console.error("[GIF] Tenor Error:", tenorError.message);
                // Fallback to Giphy API
                console.log("[GIF] Trying Giphy API");
                const giphyResponse = await axios.get("https://api.giphy.com/v1/gifs/search", {
                    params: {
                        q: query,
                        api_key: GIPHY_API_KEY,
                        limit: 1,
                        rating: "pg" // Keep content safe
                    }
                });
                const results = giphyResponse.data.data;
                if (!results || results.length === 0) {
                    throw new Error("No GIFs found on Giphy.");
                }
                gifUrl = results[0].images.original.url;
                console.log(`[GIF] Giphy GIF URL: ${gifUrl}`);
            }

            if (!gifUrl) {
                throw new Error("No valid GIF URL found from either API.");
            }

            // Download GIF
            const response = await axios({
                url: gifUrl,
                method: "GET",
                responseType: "stream"
            });

            const writer = fs.createWriteStream(outFile);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on("finish", resolve);
                writer.on("error", reject);
            });

            // Verify file
            if (!fs.existsSync(outFile) || fs.statSync(outFile).size === 0) {
                throw new Error("Downloaded GIF file is missing or empty.");
            }

            // Send GIF to WhatsApp
            await sock.sendMessage(
                jid,
                {
                    document: { url: outFile },
                    mimetype: "image/gif",
                    fileName: `${query}.gif`
                },
                { quoted: m }
            );

            // Clean up
            fs.unlinkSync(outFile);
            console.log(`[GIF] Cleaned up: ${outFile}`);
        } catch (err) {
            console.error("[GIF] Error:", err.message);
            await sock.sendMessage(
                jid,
                { text: `❌ Failed to fetch GIF.\nError: ${err.message}\nTry a different search term (e.g., .gif love).` },
                { quoted: m }
            );
        }
    }
};
