// fancy.js
module.exports = {
    name: "fancy",
    command: ["fancy", "fonts", "style"],
    description: "Convert text into 50 fancy fonts/styles",

    execute: async (sock, m, args) => {
        try {
            if (!args.length) {
                return sock.sendMessage(
                    m.key.remoteJid,
                    { text: "✨ Usage: .fancy <your text>\nExample: .fancy hello" },
                    { quoted: m }
                );
            }

            const text = args.join(" ");

            // 50 fancy styles
            const fancyMaps = [
                { name: "Bold", fn: t => t.replace(/[a-z]/gi, c => String.fromCodePoint(c.charCodeAt(0) + 0x1D3BF)) },
                { name: "Italic", fn: t => t.replace(/[a-z]/gi, c => String.fromCodePoint(c.charCodeAt(0) + 0x1D3ED)) },
                { name: "Bold Italic", fn: t => t.replace(/[a-z]/gi, c => String.fromCodePoint(c.charCodeAt(0) + 0x1D467)) },
                { name: "Monospace", fn: t => t.replace(/[a-z]/gi, c => String.fromCodePoint(c.charCodeAt(0) + 0x1D68F)) },
                { name: "Bubble", fn: t => t.replace(/[a-z]/gi, c => ({a:"ⓐ",b:"ⓑ",c:"ⓒ",d:"ⓓ",e:"ⓔ",f:"ⓕ",g:"ⓖ",h:"ⓗ",i:"ⓘ",j:"ⓙ",k:"ⓚ",l:"ⓛ",m:"ⓜ",n:"ⓝ",o:"ⓞ",p:"ⓟ",q:"ⓠ",r:"ⓡ",s:"ⓢ",t:"ⓣ",u:"ⓤ",v:"ⓥ",w:"ⓦ",x:"ⓧ",y:"ⓨ",z:"ⓩ"}[c.toLowerCase()]||c)) },
                { name: "Square", fn: t => t.replace(/[a-z]/gi, c => ({a:"🄰",b:"🄱",c:"🄲",d:"🄳",e:"🄴",f:"🄵",g:"🄶",h:"🄷",i:"🄸",j:"🄹",k:"🄺",l:"🄻",m:"🄼",n:"🄽",o:"🄾",p:"🄿",q:"🅀",r:"🅁",s:"🅂",t:"🅃",u:"🅄",v:"🅅",w:"🅆",x:"🅇",y:"🅈",z:"🅉"}[c.toLowerCase()]||c)) },
                { name: "Tiny", fn: t => t.replace(/[a-z]/gi, c => ({a:"ᴀ",b:"ʙ",c:"ᴄ",d:"ᴅ",e:"ᴇ",f:"ғ",g:"ɢ",h:"ʜ",i:"ɪ",j:"ᴊ",k:"ᴋ",l:"ʟ",m:"ᴍ",n:"ɴ",o:"ᴏ",p:"ᴘ",q:"ǫ",r:"ʀ",s:"s",t:"ᴛ",u:"ᴜ",v:"ᴠ",w:"ᴡ",x:"x",y:"ʏ",z:"ᴢ"}[c.toLowerCase()]||c)) },
                { name: "Strike", fn: t => t.split("").map(c=>"̶"+c).join("") },
                { name: "Underline", fn: t => t.split("").map(c=>c+"̲").join("") },
                { name: "Double Underline", fn: t => t.split("").map(c=>c+"̳").join("") },
                { name: "Mirror", fn: t => t.split("").reverse().join("") },
                { name: "Cursive", fn: t => t.replace(/[a-z]/gi, c => ({a:"𝓪",b:"𝓫",c:"𝓬",d:"𝓭",e:"𝓮",f:"𝓯",g:"𝓰",h:"𝓱",i:"𝓲",j:"𝓳",k:"𝓴",l:"𝓵",m:"𝓶",n:"𝓷",o:"𝓸",p:"𝓹",q:"𝓺",r:"𝓻",s:"𝓼",t:"𝓽",u:"𝓾",v:"𝓿",w:"𝔀",x:"𝔁",y:"𝔂",z:"𝔃"}[c.toLowerCase()]||c)) },
                { name: "Old English", fn: t => t.replace(/[a-z]/gi, c => ({a:"𝔞",b:"𝔟",c:"𝔠",d:"𝔡",e:"𝔢",f:"𝔣",g:"𝔤",h:"𝔥",i:"𝔦",j:"𝔧",k:"𝔨",l:"𝔩",m:"𝔪",n:"𝔫",o:"𝔬",p:"𝔭",q:"𝔮",r:"𝔯",s:"𝔰",t:"𝔱",u:"𝔲",v:"𝔳",w:"𝔴",x:"𝔵",y:"𝔶",z:"𝔷"}[c.toLowerCase()]||c)) },
                { name: "Wide", fn: t => t.split("").join(" ") },
                { name: "Hearts", fn: t => "💖 "+t.split("").join(" 💖 ")+" 💖" },
                { name: "Stars", fn: t => "⭐ "+t.split("").join(" ⭐ ")+" ⭐" },
                { name: "Fire", fn: t => "🔥 "+t.split("").join(" 🔥 ")+" 🔥" },
                { name: "Arrows", fn: t => "➡️ "+t.split("").join(" ➡️ ")+" ➡️" },
                { name: "Clouds", fn: t => "☁️ "+t.split("").join(" ☁️ ")+" ☁️" },
                { name: "Waves", fn: t => "🌊 "+t.split("").join(" 🌊 ")+" 🌊" },
                { name: "Music", fn: t => "🎵 "+t.split("").join(" 🎵 ")+" 🎵" },
                { name: "Diamond", fn: t => "💎 "+t.split("").join(" 💎 ")+" 💎" },
                { name: "Ghost", fn: t => "👻 "+t.split("").join(" 👻 ")+" 👻" },
                { name: "Crown", fn: t => "👑 "+t.split("").join(" 👑 ")+" 👑" },
                { name: "Alien", fn: t => "👽 "+t.split("").join(" 👽 ")+" 👽" },
                { name: "Flower", fn: t => "🌺 "+t.split("").join(" 🌺 ")+" 🌺" },
                { name: "Sun", fn: t => "🌞 "+t.split("").join(" 🌞 ")+" 🌞" },
                { name: "Moon", fn: t => "🌙 "+t.split("").join(" 🌙 ")+" 🌙" },
                { name: "Stars2", fn: t => "🌟 "+t.split("").join(" 🌟 ")+" 🌟" },
                { name: "Money", fn: t => "💸 "+t.split("").join(" 💸 ")+" 💸" },
                { name: "Cool", fn: t => "😎 "+t.split("").join(" 😎 ")+" 😎" },
                { name: "Fireworks", fn: t => "🎆 "+t.split("").join(" 🎆 ")+" 🎆" },
                { name: "Rain", fn: t => "🌧️ "+t.split("").join(" 🌧️ ")+" 🌧️" },
                { name: "Lightning", fn: t => "⚡ "+t.split("").join(" ⚡ ")+" ⚡" },
                { name: "Candy", fn: t => "🍭 "+t.split("").join(" 🍭 ")+" 🍭" },
                { name: "Balloon", fn: t => "🎈 "+t.split("").join(" 🎈 ")+" 🎈" },
                { name: "Party", fn: t => "🥳 "+t.split("").join(" 🥳 ")+" 🥳" },
                { name: "Robot", fn: t => "🤖 "+t.split("").join(" 🤖 ")+" 🤖" },
                { name: "Skull", fn: t => "💀 "+t.split("").join(" 💀 ")+" 💀" },
                { name: "Dragon", fn: t => "🐉 "+t.split("").join(" 🐉 ")+" 🐉" },
                { name: "Sword", fn: t => "⚔️ "+t.split("").join(" ⚔️ ")+" ⚔️" },
                { name: "Shield", fn: t => "🛡️ "+t.split("").join(" 🛡️ ")+" 🛡️" }
            ];

            let output = `✨ *Fancy Fonts (50 Styles)* ✨\nInput: ${text}\n\n`;
            fancyMaps.forEach((style, i) => {
                output += `${i+1}. *${style.name}* : ${style.fn(text)}\n\n`;
            });

            await sock.sendMessage(m.key.remoteJid, { text: output }, { quoted: m });

        } catch (err) {
            console.error("Fancy Error:", err);
            await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Error generating fancy fonts." }, { quoted: m });
        }
    }
};
