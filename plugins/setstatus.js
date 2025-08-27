const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { MessageMedia } = require("whatsapp-web.js");

module.exports = {
    name: "setstatus",
    command: ["setstatus", "set status"], // Supports .setstatus and .set status
    description: "Automatically set a photo or video as WhatsApp status.",

    async execute(sock, m, args) {
        const jid = m.key.remoteJid;
        let mediaPath;
        let mediaType;

        try {
            console.log(`[SetStatus] Received command: ${m.body} from ${jid}`);

            // Check if a URL is provided or a media message is replied to
            if (args[0] && (args[0].startsWith("http://") || args[0].startsWith("https://"))) {
                // Handle URL input
                const url = args[0];
                console.log(`[SetStatus] Downloading media from URL: ${url}`);

                // Create downloads folder
                const downloadsDir = path.join(__dirname, "../downloads");
                if (!fs.existsSync(downloadsDir)) {
                    fs.mkdirSync(downloadsDir, { recursive: true });
                }

                // Determine file extension and type
                const extension = url.match(/\.(jpg|jpeg|png|mp4)$/i)?.[1]?.toLowerCase();
                if (!extension || !["jpg", "jpeg", "png", "mp4"].includes(extension)) {
                    throw new Error("Unsupported media type. Use JPEG, PNG, or MP4.");
                }
                mediaType = extension === "mp4" ? "video/mp4" : "image/jpeg";
                mediaPath = path.join(downloadsDir, `${Date.now()}.${extension}`);

                // Download media
                const response = await axios({
                    url,
                    method: "GET",
                    responseType: "stream",
                    timeout: 30000 // 30-second timeout
                });

                const writer = fs.createWriteStream(mediaPath);
                response.data.pipe(writer);

                await new Promise((resolve, reject) => {
                    writer.on("finish", resolve);
                    writer.on("error", reject);
                });
            } else if (m.hasQuotedMsg) {
                // Handle replied-to media message
                const quotedMsg = await m.getQuotedMessage();
                if (!quotedMsg.hasMedia) {
                    return sock.sendMessage(
                        jid,
                        { text: "❌ Replied message does not contain media. Reply to an image or video or provide a URL." },
                        { quoted: m }
                    );
                }

                console.log("[SetStatus] Processing replied media");
                const media = await quotedMsg.downloadMedia();
                if (!media) {
                    throw new Error("Failed to download media from replied message.");
                }

                // Determine media type
                mediaType = media.mimetype;
                if (!mediaType.includes("image") && !mediaType.includes("video")) {
                    throw new Error("Replied media must be an image (JPEG/PNG) or video (MP4).");
                }

                // Save media to temporary file
                const downloadsDir = path.join(__dirname, "../downloads");
                if (!fs.existsSync(downloadsDir)) {
                    fs.mkdirSync(downloadsDir, { recursive: true });
                }

                mediaPath = path.join(downloadsDir, `${Date.now()}.${mediaType.includes("video") ? "mp4" : "jpg"}`);
                fs.writeFileSync(mediaPath, Buffer.from(media.data, "base64"));
            } else {
                return sock.sendMessage(
                    jid,
                    { text: "❌ Please provide a media URL or reply to an image/video.\nExample: `.setstatus https://example.com/image.jpg` or reply to a media message." },
                    { quoted: m }
                );
            }

            // Verify file
            if (!fs.existsSync(mediaPath) || fs.statSync(mediaPath).size === 0) {
                throw new Error("Media file is missing or empty.");
            }

            // Check file size (WhatsApp status limit: ~100MB)
            const fileSize = fs.statSync(mediaPath).size / (1024 * 1024); // MB
            if (fileSize > 100) {
                throw new Error("Media file is too large. WhatsApp status supports up to ~100MB.");
            }

            // Notify user
            await sock.sendMessage(
                jid,
                { text: `⏳ Setting *${mediaType.includes("video") ? "video" : "image"}* as status...` },
                { quoted: m }
            );

            // Create MessageMedia object
            const media = MessageMedia.fromFilePath(mediaPath);

            // Set status
            await sock.sendMessage("status@broadcast", {
                [mediaType.includes("video") ? "video" : "image"]: media,
                caption: args.join(" ") || "" // Optional caption
            });

            // Confirm success
            await sock.sendMessage(
                jid,
                { text: `✅ Status set successfully!` },
                { quoted: m }
            );

            // Clean up
            fs.unlinkSync(mediaPath);
            console.log(`[SetStatus] Cleaned up: ${mediaPath}`);
        } catch (err) {
            console.error("[SetStatus] Error:", err.message);
            await sock.sendMessage(
                jid,
                { text: `❌ Failed to set status.\nError: ${err.message}\nPlease try a different media file or URL.` },
                { quoted: m }
            );
        }
    }
};
