const { createCanvas } = require("canvas");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");

module.exports = {
    name: "textsticker",
    command: ["textsticker", "tsticker", "ts"],
    execute: async (sock, m, args) => {
        try {
            if(!args[0]){
                return await sock.sendMessage(
                    m.key.remoteJid,
                    { text: "⚠️ Give me some text!\nExample: `.textsticker SOURAV`" },
                    { quoted: m }
                );
            }

            const text = args.join(" ");
            const width = 512;
            const height = 512;
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext("2d");

            // Transparent background
            ctx.clearRect(0,0,width,height);

            // Gradient + Random Color for each letter
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            const fonts = ["Sans","Serif","Arial","Courier","Georgia","Impact"];
            const fontSize = Math.floor(Math.random()*60)+70;
            ctx.font = `bold ${fontSize}px ${fonts[Math.floor(Math.random()*fonts.length)]}`;

            // Draw each letter with random bold color
            let x = width/2;
            let y = height/2;
            const letters = text.split("");
            let offsetX = -(letters.length-1)*fontSize/4;

            letters.forEach((ch,i)=>{
                const color = `hsl(${Math.random()*360},100%,50%)`;
                ctx.fillStyle = color;
                ctx.fillText(ch, x + offsetX + i*fontSize/1.5, y);
            });

            const buffer = canvas.toBuffer();
            const sticker = new Sticker(buffer, {
                pack: "🔥 SOURAV_MD STICKERS",
                author: "SOURAV_MD 💎",
                type: StickerTypes.FULL,
                quality: 100,
            });

            const stickerBuffer = await sticker.build();
            await sock.sendMessage(
                m.key.remoteJid,
                { sticker: stickerBuffer },
                { quoted: m }
            );

        } catch(err){
            console.error("TextSticker Error:", err);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "❌ Failed to create sticker." },
                { quoted: m }
            );
        }
    }
};
