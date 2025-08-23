const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "aivideo",
    alias: ["aivideo", "imaginevideo"],
    category: "AI",
    desc: "Generate realistic AI video from text prompt",
    async execute(sock, m, args) {
        try {
            if (!args.length) {
                return sock.sendMessage(m.chat, { text: "❌ Please provide a prompt!\nExample: .aivideo a cat dancing in space" }, { quoted: m });
            }

            const prompt = args.join(" ");

            // Put your HF token here or in process.env.HF_API_KEY
            const HF_TOKEN = process.env.HF_API_KEY || "hf_your_api_key_here";

            if (!HF_TOKEN.startsWith("hf_")) {
                return sock.sendMessage(m.chat, { text: "⚠️ Invalid or missing Hugging Face API Key.\nAdd it in your environment or directly inside the code." }, { quoted: m });
            }

            sock.sendMessage(m.chat, { text: `🎥 Generating AI video for: *${prompt}*...\n⏳ Please wait...` }, { quoted: m });

            // Example using a video model (stabilityai/stable-video-diffusion-img2vid)
            const response = await axios.post(
                "https://api-inference.huggingface.co/models/stabilityai/stable-video-diffusion-img2vid",
                { inputs: prompt },
                { headers: { Authorization: `Bearer ${HF_TOKEN}` }, responseType: "arraybuffer" }
            );

            if (response.status !== 200) {
                return sock.sendMessage(m.chat, { text: `❌ Failed to generate video (Status: ${response.status})` }, { quoted: m });
            }

            const outputPath = path.join(__dirname, "aivideo.mp4");
            fs.writeFileSync(outputPath, response.data);

            await sock.sendMessage(m.chat, {
                video: fs.readFileSync(outputPath),
                caption: `✅ AI Video generated for: *${prompt}*`
            }, { quoted: m });

            fs.unlinkSync(outputPath); // cleanup
        } catch (err) {
            console.error("AI Video Error:", err.message);
            sock.sendMessage(m.chat, { text: `❌ Error generating video: ${err.message}` }, { quoted: m });
        }
    }
};
