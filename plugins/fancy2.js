// fancy2.js
// Fancy Text Generator v2 (50+ unique font styles)

module.exports = {
    name: "fancy2",
    command: ["fancy2", "font2", "style2"],
    description: "Convert text into 50+ fancy fonts (choose style)",

    execute: async (sock, m, args) => {
        try {
            if (!args || args.length < 2) {
                return sock.sendMessage(
                    m.key.remoteJid,
                    { text: "⚠️ Usage: .fancy2 <style> <text>\nExample: .fancy2 bold hello world" },
                    { quoted: m }
                );
            }

            const styleName = args[0].toLowerCase();
            const text = args.slice(1).join(" ");

            // 🔥 Full set of 50+ unique font styles
            const fonts = {
                bold: "𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘵𝘶𝘃𝘄𝘅𝘆𝘇",
                italic: "𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻",
                bolditalic: "𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯",
                monospace: "𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣",
                script: "𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃",
                boldscript: "𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩".toLowerCase(),
                fraktur: "𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷",
                boldfraktur: "𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫",
                double: "𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫".toUpperCase(),
                wide: "ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ",
                smallcaps: "ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ",
                upside: "ɐqɔpǝɟƃɥᴉɾʞʅɯuodbɹsʇnʌʍxʎz",
                tiny: "ᵃᵇᶜᵈᵉᶠᵍʰᶦʲᵏˡᵐⁿᵒᵖᑫʳˢᵗᵘᵛʷˣʸᶻ",
                strike: "a̶b̶c̶d̶e̶f̶g̶h̶i̶j̶k̶l̶m̶n̶o̶p̶q̶r̶s̶t̶u̶v̶w̶x̶y̶z̶",
                underline: "a̲b̲c̲d̲e̲f̲g̲h̲i̲j̲k̲l̲m̲n̲o̲p̲q̲r̲s̲t̲u̲v̲w̲x̲y̲z̲",
                bubble: "ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ",
                square: "🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉",
                blacksquare: "⬛🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉",
                cursive: "𝒶𝒷𝒸𝒹𝑒𝒻𝑔𝒽𝒾𝒿𝓀𝓁𝓂𝓃𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏",
                fancy: "ɑвɔdєfɢнιjκlмησρqяsτυvшxуz",
                slant: "𝑎𝑏𝑐𝑑𝑒𝑓𝑔ℎ𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧",
                shadow: "a̷b̷c̷d̷e̷f̷g̷h̷i̷j̷k̷l̷m̷n̷o̷p̷q̷r̷s̷t̷u̷v̷w̷x̷y̷z̷",
                dots: "ạḅċḍėḟġḥịĵḳḷṁṅọṗqṛṡṭụṿẇẋẏẓ",
                stars: "a★b★c★d★e★f★g★h★i★j★k★l★m★n★o★p★q★r★s★t★u★v★w★x★y★z",
                waves: "a̴b̴c̴d̴e̴f̴g̴h̴i̴j̴k̴l̴m̴n̴o̴p̴q̴r̴s̴t̴u̴v̴w̴x̴y̴z̴",
                glitch: "a̷b̷c̷d̷e̷f̷g̷h̷i̷j̷k̷l̷m̷n̷o̷p̷q̷r̷s̷t̷u̷v̷w̷x̷y̷z̷",
                magic: "ค๒ς๔єŦﻮђเןкɭ๓ภ๏קợгรՇยשฬאץչ",
                greek: "αβςδεφγηιϳκλμνορϙρστυϑωχψζ",
                gothic: "𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟",
                serif: "𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳",
                sans: "𝖺𝖻𝖼𝖽𝖾𝖿𝗀𝗁𝗂𝗃𝗄𝗅𝗆𝗇𝗈𝗉𝗊𝗋𝗌𝗍𝗎𝗏𝗐𝗑𝗒𝗓",
                fullwidth: "ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ".toLowerCase(),
                invert: "∀qϽᗡƎℲ⅁HIſʞ˥WNOԀΌᴚS⊥∩ΛMX⅄Z".toLowerCase(),
                funky: "卂乃匚ᗪ乇千Ꮆ卄丨ﾌҜㄥ爪几ㄖ卩Ɋ尺丂ㄒㄩᐯ山乂ㄚ乙",
                fairy: "ᎪᏰᏨᎠᎬᎰᏀᎻᎥᏠᏦᏝᎷᏁᎾᏢᎤᎡᏚᏖᏬᏉᏔጀᎽᏃ",
                neon: "ᗩᗷᑕᗪEᖴGᕼIᒍKᒪᗰᑎOᑭᑫᖇSTᑌᐯᗯ᙭Yᘔ",
                outlined: "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ".toLowerCase(),
                mixed: "αв¢∂єƒgнιנкℓмησρqяѕтυνωχуz",
                circle: "🄐🄑🄒🄓🄔🄕🄖🄗🄘🄙🄚🄛🄜🄝🄞🄟🄠🄡🄢🄣🄤🄥🄦🄧🄨🄩",
                triangle: "∆ɓςdεғɠнเʝҡℓмиσρҩяѕтυνωχуz",
                heart: "ɑ♥b♥c♥d♥e♥f♥g♥h♥i♥j♥k♥l♥m♥n♥o♥p♥q♥r♥s♥t♥u♥v♥w♥x♥y♥z♥",
                diamond: "a♦b♦c♦d♦e♦f♦g♦h♦i♦j♦k♦l♦m♦n♦o♦p♦q♦r♦s♦t♦u♦v♦w♦x♦y♦z♦",
                lightning: "α⚡b⚡c⚡d⚡e⚡f⚡g⚡h⚡i⚡j⚡k⚡l⚡m⚡n⚡o⚡p⚡q⚡r⚡s⚡t⚡u⚡v⚡w⚡x⚡y⚡z",
                fire: "a🔥b🔥c🔥d🔥e🔥f🔥g🔥h🔥i🔥j🔥k🔥l🔥m🔥n🔥o🔥p🔥q🔥r🔥s🔥t🔥u🔥v🔥w🔥x🔥y🔥z🔥",
            };

            const alphabet = "abcdefghijklmnopqrstuvwxyz";

            if (!fonts[styleName]) {
                const available = Object.keys(fonts).join(", ");
                return sock.sendMessage(
                    m.key.remoteJid,
                    { text: `⚠️ Unknown style: ${styleName}\n\nAvailable: ${available}` },
                    { quoted: m }
                );
            }

            const fontMap = fonts[styleName];

            const convert = (txt) =>
                txt.split("").map(ch => {
                    const idx = alphabet.indexOf(ch.toLowerCase());
                    if (idx !== -1 && fontMap[idx]) return fontMap[idx];
                    return ch;
                }).join("");

            const result = convert(text);

            await sock.sendMessage(
                m.key.remoteJid,
                { text: `✨ Style: ${styleName}\n\n${result}` },
                { quoted: m }
            );

        } catch (err) {
            console.error("❌ fancy2 error:", err);
            await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Error generating fancy text." }, { quoted: m });
        }
    }
};
