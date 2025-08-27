const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { MessageMedia } = require("whatsapp-web.js");

module.exports = {
    name: "setstatus",
    command: ["setstatus", "set status"], // Supports .setstatus and .set status
    description: "Set a photo or video as WhatsApp status.",

    async execute(sock, m, args) {
        const jid = m.key.remoteJid;
        console.log(`[SetStatus] Received command: ${m.body} from ${jid}`);

        let mediaPath;
        let mediaType;

        try {
            // Check for URL or replied media
            if (args[0] && (args[0].startsWith("http://") || args[0].startsWith("https://"))) {
                const url = args[0];
                console.log(`[SetStatus] Downloading from URL: ${url}`);

                // Create downloads folder
                const downloadsDir = path.join(__dirname, "../downloads");
                if (!fs.existsSync(downloadsDir)) {
                    fs.mkdirSync(downloadsDir, { recursive: true });
                }

                const extension = url.match(/\.(jpg|jpeg|png|mp4)$/i)?.[1]?.toLowerCase();
                if (!extension || !["jpg", "jpeg", "png", "mp4"].includes(extension)) {
                    throw new Error("Unsupported media type. Use JPEG, PNG, or MP4.");
                }
                mediaType = extension === "mp4" ? "video/mp4" : "image/jpeg";
                mediaPath = path.join(downloadsDir, `${Date.now()}.${extension}`);

                const response = await axios({
                    url,
                    method: "GET",
                    responseType: "stream",
                    timeout: 30000
                });

                const writer = fs.createWriteStream(mediaPath);
                response.data.pipe(writer);

                await new Promise((resolve, reject) => {
                    writer.on("finish", resolve);
                    writer.on("error", reject);
                });
            } else if (m.hasQuotedMsg) {
                const quotedMsg = await m.getQuotedMessage();
                if (!quotedMsg.hasMedia) {
                    return sock.sendMessage(
                        jid,
                        { text: "❌ উত্তর দেওয়া বার্তায় মিডিয়া নেই। একটি ছবি বা ভিডিওতে উত্তর দিন বা URL দিন।" },
                        { quoted: m }
                    );
                }

                console.log("[SetStatus] Processing replied media");
                const media = await quotedMsg.downloadMedia();
                if (!media) {
                    throw new Error("Failed to download media from replied message.");
                }

                mediaType = media.mimetype;
                if (!mediaType.includes("image") && !mediaType.includes("video")) {
                    throw new Error("Replied media must be an image (JPEG/PNG) or video (MP4).");
                }

                const downloadsDir = path.join(__dirname, "../downloads");
                if (!fs.existsSync(downloadsDir)) {
                    fs.mkdirSync(downloadsDir, { recursive: true });
                }
                mediaPath = path.join(downloadsDir, `${Date.now()}.${mediaType.includes("video") ? "mp4" : "jpg"}`);
                fs.writeFileSync(mediaPath, Buffer.from(media.data, "base64"));
            } else {
                return sock.sendMessage(
                    jid,
                    { text: "❌ দয়া করে একটি মিডিয়া URL দিন বা একটি ছবি/ভিডিওতে উত্তর দিন।\nউদাহরণ: `.setstatus https://example.com/image.jpg`" },
                    { quoted: m }
                );
            }

            // Verify file
            if (!fs.existsSync(mediaPath) || fs.statSync(mediaPath).size === 0) {
                throw new Error("Media file is missing or empty.");
            }

            // Check file size (WhatsApp limit: ~100MB)
            const fileSize = fs.statSync(mediaPath).size / (1024 * 1024);
            if (fileSize > 100) {
                throw new Error("Media file is too large. WhatsApp status supports up to ~100MB.");
            }

            // Notify user
            await sock.sendMessage(
                jid,
                { text: `⏳ *${mediaType.includes("video") ? "ভিডিও" : "ছবি"}* স্ট্যাটাস হিসেবে সেট করা হচ্ছে...` },
                { quoted: m }
            );

            // Set status
            const media = MessageMedia.fromFilePath(mediaPath);
            await sock.sendMessage("status@broadcast", {
                [mediaType.includes("video") ? "video" : "image"]: media,
                caption: args.join(" ") || ""
            });

            // Confirm success
            await sock.sendMessage(
                jid,
                { text: `✅ স্ট্যাটাস সফলভাবে সেট করা হয়েছে!` },
                { quoted: m }
            );

            // Clean up
            fs.unlinkSync(mediaPath);
            console.log(`[SetStatus] Cleaned up: ${mediaPath}`);
        } catch (err) {
            console.error("[SetStatus] Error:", err.message);
            await sock.sendMessage(
                jid,
                { text: `❌ স্ট্যাটাস সেট করতে ব্যর্থ।\nকারণ: ${err.message}\nঅন্য মিডিয়া ফাইল বা URL চেষ্টা করুন।` },
                { quoted: m }
            );
        }
    }
};
