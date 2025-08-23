// plugins/aivideo.js
const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "aivideo",
    alias: ["aivideo", "genvideo", "videoai"],
    category: "AI Tools",
    desc: "Generate ultra-realistic AI videos with pro failover system",
    async execute(sock, m, args) {
        const prompt = args.join(" ");
        if (!prompt) {
            return sock.sendMessage(m.chat, { text: "⚡ Usage: .aivideo <your prompt>" }, { quoted: m });
        }

        // TEMP storage path
        const filePath = path.join(__dirname, `../temp/${Date.now()}.mp4`);

        // Providers list (auto fallback if one fails)
        const providers = [
            {
                name: "StabilityAI",
                url: "https://api.stability.ai/v2beta/stable-video/generate",
                key: process.env.STABILITY_API_KEY,
                headers: (key) => ({
                    Authorization: `Bearer ${key}`,
                    Accept: "application/json",
                    "Content-Type": "application/json",
                }),
                payload: (p) => ({
                    prompt: p,
                    output_format: "mp4",
                    cfg_scale: 12,
                    motion_bucket_id: 80,
                    seed: Math.floor(Math.random() * 9999999),
                }),
                parse: (res) => Buffer.from(res.data.video, "base64"),
            },
            {
                name: "RunwayML",
                url: "https://api.runwayml.com/v1/video/generations",
                key: process.env.RUNWAY_API_KEY,
                headers: (key) => ({
                    Authorization: `Bearer ${key}`,
                    "Content-Type": "application/json",
                }),
                payload: (p) => ({
                    prompt: p,
                    model: "gen3",
                }),
                parse: (res) => Buffer.from(res.data.video, "base64"),
            },
            {
                name: "PikaLabs",
                url: "https://api.pika.art/v1/videos",
                key: process.env.PIKA_API_KEY,
                headers: (key) => ({
                    Authorization: `Bearer ${key}`,
                    "Content-Type": "application/json",
                }),
                payload: (p) => ({ prompt: p }),
                parse: (res) => Buffer.from(res.data.video, "base64"),
            },
        ];

        let success = false;

        for (const provider of providers) {
            if (!provider.key) {
                console.log(`⚠️ Skipping ${provider.name}: API key missing`);
                continue;
            }

            try {
                console.log(`⚡ Trying provider: ${provider.name}`);
                const response = await axios.post(
                    provider.url,
                    provider.payload(prompt),
                    { headers: provider.headers(provider.key), timeout: 120000 }
                );

                if (!response.data) throw new Error("Empty response");

                const videoBuffer = provider.parse(response);
                fs.writeFileSync(filePath, videoBuffer);

                await sock.sendMessage(
                    m.chat,
                    { video: fs.readFileSync(filePath), caption: `🎬 Generated with ${provider.name}\n💡 Prompt: *${prompt}*` },
                    { quoted: m }
                );

                fs.unlinkSync(filePath);
                success = true;
                break; // stop after first success
            } catch (err) {
                console.error(`❌ ${provider.name} failed:`, err.message);
            }
        }

        if (!success) {
            return sock.sendMessage(m.chat, { text: "❌ All AI video providers failed. Try again later." }, { quoted: m });
        }
    }
};
