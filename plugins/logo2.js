const axios = require("axios");

module.exports = {
    name: "logo",
    command: [ "logo2"],
    description: "Generate realistic logos using 6 separate APIs with fallback",

    async execute(sock, m, args) {
        const jid = m.key.remoteJid;
        const [style, ...textArr] = args;
        const text = textArr.join(" ");

        if (!style || !text) {
            return sock.sendMessage(jid, { text: `⚠️ Usage: .logo <style> <text>` }, { quoted: m });
        }

        await sock.sendMessage(jid, { text: `⏳ Generating logo for: ${text} with style: ${style}` }, { quoted: m });

        // 6 distinct logo APIs
        const apis = [
            { name: "LogoAI", url: `https://api.logoai.com/v1/logo?style=${style}&text=${encodeURIComponent(text)}` },
            { name: "LogoPony", url: `https://api.logopony.com/v1/create?style=${style}&text=${encodeURIComponent(text)}` },
            { name: "Looka", url: `https://api.looka.com/v1/generate?style=${style}&text=${encodeURIComponent(text)}` },
            { name: "Recraft", url: `https://api.recraft.ai/v1/logo?style=${style}&text=${encodeURIComponent(text)}` },
            { name: "LogoDiffusion", url: `https://api.logodiffusion.com/v1/create?style=${style}&text=${encodeURIComponent(text)}` },
            { name: "DeepAI", url: `https://api.deepai.org/v1/logo?style=${style}&text=${encodeURIComponent(text)}` },
        ];

        let imageUrl;

        // Try each API until success
        for (const api of apis) {
            try {
                const res = await axios.get(api.url, { timeout: 10000 });
                if (res.status === 200 && res.data && res.data.imageUrl) {
                    imageUrl = res.data.imageUrl;
                    console.log(`[SUCCESS] Generated logo with ${api.name}`);
                    break;
                }
            } catch (e) {
                console.warn(`[FAIL] ${api.name} failed: ${e.message}`);
                continue;
            }
        }

        if (!imageUrl) {
            return sock.sendMessage(jid, { text: "❌ Failed to generate logo with all APIs." }, { quoted: m });
        }

        // Send the image
        await sock.sendMessage(jid, {
            image: { url: imageUrl },
            caption: `✨ Logo generated: *${text}*`
        }, { quoted: m });
    }
};
