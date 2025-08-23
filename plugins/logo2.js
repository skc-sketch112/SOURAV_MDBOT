const axios = require("axios");

const effects = {
    // 🔹 Single-text effects
    sand: { url: "https://photooxy-api-eta.vercel.app/api/sand?text=", multi: false },
    smoke: { url: "https://photooxy-api-eta.vercel.app/api/smoke?text=", multi: false },
    fire: { url: "https://photooxy-api-eta.vercel.app/api/fire?text=", multi: false },
    neon: { url: "https://photooxy-api-eta.vercel.app/api/neon?text=", multi: false },
    sky: { url: "https://photooxy-api-eta.vercel.app/api/sky?text=", multi: false },
    thunder: { url: "https://photooxy-api-eta.vercel.app/api/thunder?text=", multi: false },
    wood: { url: "https://photooxy-api-eta.vercel.app/api/wood?text=", multi: false },
    stone: { url: "https://photooxy-api-eta.vercel.app/api/stone?text=", multi: false },
    metal: { url: "https://photooxy-api-eta.vercel.app/api/metal?text=", multi: false },
    ice: { url: "https://photooxy-api-eta.vercel.app/api/ice?text=", multi: false },
    gradient: { url: "https://photooxy-api-eta.vercel.app/api/gradient?text=", multi: false },
    harrypotter: { url: "https://photooxy-api-eta.vercel.app/api/harrypotter?text=", multi: false },
    butterfly: { url: "https://photooxy-api-eta.vercel.app/api/butterfly?text=", multi: false },
    shadow: { url: "https://photooxy-api-eta.vercel.app/api/shadow?text=", multi: false },
    water: { url: "https://photooxy-api-eta.vercel.app/api/water?text=", multi: false },
    blood: { url: "https://photooxy-api-eta.vercel.app/api/blood?text=", multi: false },
    graffiti: { url: "https://photooxy-api-eta.vercel.app/api/graffiti?text=", multi: false },
    galaxy: { url: "https://photooxy-api-eta.vercel.app/api/galaxy?text=", multi: false },

    // 🔹 Multi-text effects (Name1 + Name2)
    heart: { url: "https://photooxy-api-eta.vercel.app/api/heart?text1={t1}&text2={t2}", multi: true },
    couple: { url: "https://photooxy-api-eta.vercel.app/api/couple?text1={t1}&text2={t2}", multi: true },
    beach: { url: "https://photooxy-api-eta.vercel.app/api/beach?text1={t1}&text2={t2}", multi: true },
    love: { url: "https://photooxy-api-eta.vercel.app/api/love?text1={t1}&text2={t2}", multi: true },
};

module.exports = {
    name: "logo",
    command: ["logo"],
    description: "Generate 25+ realistic logo styles",

    async execute(sock, m, args) {
        const [style, ...rest] = args;

        if (!style || !effects[style]) {
            let menu = "🎨 *Available Logo Styles:*\n\n";
            for (let key in effects) {
                menu += `• ${key}\n`;
            }
            menu += `\n👉 Example:\n.logo sand Subhayan\n.logo fire King\n.logo heart Subhayan Priya`;
            return await sock.sendMessage(
                m.key.remoteJid
