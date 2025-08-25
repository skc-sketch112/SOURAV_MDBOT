const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "edit",
    alias: ["photoedit"],
    description: "Apply 30+ pro + AI photo effects",
    category: "tools",
    usage: ".edit <effect>",

    async run(m, { sock, args }) {
        if (!m.quoted || !m.quoted.message.imageMessage) {
            return m.reply("📸 Reply to an image with `.edit <effect>`");
        }

        const effect = (args[0] || "").toLowerCase();
        const extra = args.slice(1).join(" "); // for text input

        const validEffects = [
            // Old list
            "grayscale","invert","sepia","blur","brighten","darken","sharpen","resize","flip","flop","rotate",
            "swirl","implode","edge","charcoal","sketch","paint","solarize","posterize","contrast","equalize",
            "negate","noise","emboss","vignette","polaroid","wave","oilpaint","mirror","implode2","spread",
            "pixelate","cartoon","glow","shadow","rotate3d","motionblur",
            // New AI-like
            "bgremove","bgwhite","bgcolor","text","meme","frame","circle","collage","glitch","oldphoto","neontext"
        ];

        if (!validEffects.includes(effect)) {
            return m.reply("❌ Invalid effect!\n✅ Available: " + validEffects.join(", "));
        }

        // Paths
        const buffer = await sock.downloadMediaMessage(m.quoted);
        const inputPath = path.join(__dirname, "../temp/input.jpg");
        const outputPath = path.join(__dirname, "../temp/output.png");
        fs.writeFileSync(inputPath, buffer);

        let command;

        // Basic effects handled here (same as before)...

        // --- AI-like New Features ---
        switch (effect) {
            case "bgremove": 
                command = `convert ${inputPath} -fuzz 20% -transparent white ${outputPath}`;
                break;

            case "bgwhite":
                command = `convert ${inputPath} -background white -flatten ${outputPath}`;
                break;

            case "bgcolor":
                let color = extra || "blue";
                command = `convert ${inputPath} -background ${color} -flatten ${outputPath}`;
                break;

            case "text":
                if (!extra) return m.reply("⚡ Use: .edit text Your_Text");
                command = `convert ${inputPath} -gravity south -pointsize 40 -fill white -annotate +0+10 "${extra}" ${outputPath}`;
                break;

            case "meme":
                if (!extra.includes("|")) return m.reply("⚡ Use: .edit meme top_text|bottom_text");
                let [top, bottom] = extra.split("|");
                command = `convert ${inputPath} -gravity north -pointsize 40 -fill white -stroke black -strokewidth 2 -annotate +0+10 "${top}" -gravity south -annotate +0+10 "${bottom}" ${outputPath}`;
                break;

            case "frame":
                command = `convert ${inputPath} -bordercolor black -border 20 ${outputPath}`;
                break;

            case "circle":
                command = `convert ${inputPath} -alpha set -background none -vignette 0x0 ${outputPath}`;
                break;

            case "collage":
                command = `montage ${inputPath} ${inputPath} ${inputPath} ${inputPath} -tile 2x2 -geometry +2+2 ${outputPath}`;
                break;

            case "glitch":
                command = `convert ${inputPath} -channel R -separate r.png; convert ${inputPath} -channel G -separate g.png; convert ${inputPath} -channel B -separate b.png; convert r.png g.png b.png -combine -wave 10x50 ${outputPath}`;
                break;

            case "oldphoto":
                command = `convert ${inputPath} -sepia-tone 80% -noise 3 ${outputPath}`;
                break;

            case "neontext":
                if (!extra) return m.reply("⚡ Use: .edit neontext Your_Text");
                command = `convert -size 800x200 xc:black -gravity center -pointsize 70 -fill cyan -annotate 0 "${extra}" -blur 0x8 -fill white -annotate 0 "${extra}" ${outputPath}`;
                break;
        }

        // Execute
        exec(command, async (err) => {
            if (err) {
                console.log(err);
                return m.reply("❌ Error running effect. Check ImageMagick install.");
            }
            const out = fs.readFileSync(outputPath);
            await sock.sendMessage(m.chat, { image: out, caption: `✨ Effect: ${effect}` }, { quoted: m });
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
        });
    }
};
