const axios = require("axios");

const effects = {
    sand: "https://api.maher-zubair.xyz/photooxy/sand-writing?text=",
    smoke: "https://api.maher-zubair.xyz/photooxy/smoke?text=",
    sky: "https://api.maher-zubair.xyz/photooxy/sky-cloud?text=",
    beach: "https://api.maher-zubair.xyz/photooxy/beach-text?text=",
    love: "https://api.maher-zubair.xyz/photooxy/love?text=",
    glass: "https://api.maher-zubair.xyz/photooxy/glass?text=",
    coffee: "https://api.maher-zubair.xyz/photooxy/coffee-cup?text=",
    fireworks: "https://api.maher-zubair.xyz/photooxy/fireworks?text=",
    neon: "https://api.maher-zubair.xyz/photooxy/neon-light?text=",
    shadow: "https://api.maher-zubair.xyz/photooxy/shadow?text=",
    glow: "https://api.maher-zubair.xyz/photooxy/glow?text=",
    wood: "https://api.maher-zubair.xyz/photooxy/wood?text=",
    metal: "https://api.maher-zubair.xyz/photooxy/metal?text=",
    blood: "https://api.maher-zubair.xyz/photooxy/blood?text=",
    fire: "https://api.maher-zubair.xyz/photooxy/fire?text=",
    water: "https://api.maher-zubair.xyz/photooxy/water?text=",
    ice: "https://api.maher-zubair.xyz/photooxy/ice?text=",
    galaxy: "https://api.maher-zubair.xyz/photooxy/galaxy?text=",
    stone: "https://api.maher-zubair.xyz/photooxy/stone?text=",
    grass: "https://api.maher-zubair.xyz/photooxy/grass?text=",
    gold: "https://api.maher-zubair.xyz/photooxy/gold?text=",
};

module.exports = {
    name: "logo2",
    command: ["logo2"],
    description: "Generate realistic text logos (20+ effects)",

    async execute(sock, m, args) {
        if (args.length < 2) {
            return sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Usage: `.logo2 <style> <text>`\n\nAvailable styles:\n" + Object.keys(effects).join(", ") },
                { quoted: m }
            );
        }

        const style = args[0].toLowerCase();
        const text = encodeURIComponent(args.slice(1).join(" "));

        if (!effects[style]) {
            return sock.sendMessage(
                m.key.remoteJid,
                { text: `❌ Invalid style!\n✅ Choose from: ${Object.keys(effects).join(", ")}` },
                { quoted: m }
            );
        }

        const url = effects[style] + text;

        try {
            await axios.get(url, { responseType: "arraybuffer" });

            await sock.sendMessage(
                m.key.remoteJid,
                {
                    image: { url },
                    caption: `✨ ${style.toUpperCase()} Logo for: ${decodeURIComponent(text)}`
                },
                { quoted: m }
            );
        } catch (err) {
            console.error("Logo2 fetch failed:", err.message);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: `❌ Logo fetch failed for *${style}*.\nTry again later.` },
                { quoted: m }
            );
        }
    }
};
