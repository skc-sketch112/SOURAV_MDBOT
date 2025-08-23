// =============== LOGO GENERATOR ===============
const axios = require("axios");

module.exports = {
    name: "logo",
    command: ["logo"],
    description: "Create stylish logo with given text",
    
    async execute(sock, m, args) {
        if (!args[0]) {
            return sock.sendMessage(m.key.remoteJid, { 
                text: "❌ Please provide text.\n👉 Example: .logo ShadowBot" 
            }, { quoted: m });
        }

        const text = args.join(" ");

        try {
            // Using a free reliable API (TextPro Mirror)
            const api = `https://api.erdwpe.com/api/textpro/shadow?text=${encodeURIComponent(text)}&apikey=freeapi`;

            let res = await axios.get(api, { responseType: "arraybuffer" });

            await sock.sendMessage(m.key.remoteJid, {
                image: Buffer.from(res.data),
                caption: `✅ Here’s your logo:\n👉 *${text}*`
            }, { quoted: m });

            console.log(`🎨 Logo created for text: ${text}`);
        } catch (err) {
            console.error("❌ Logo API error:", err.message);
            await sock.sendMessage(m.key.remoteJid, { 
                text: "⚠️ Failed to generate logo. Try again later." 
            }, { quoted: m });
        }
    }
};
