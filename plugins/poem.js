module.exports = {
    name: "poem",
    command: ["poem", "poems"],
    description: "Get random poems with categories",
    category: "Fun",

    async execute(sock, m, args) {
        try {
            // 📝 Categories with poems
            const categories = {
                love: [
                    "❤️ Love is the flame that warms the night,\nGuiding hearts with gentle light.",
                    "💕 In every beat, love softly sings,\nA melody on endless wings.",
                    "🌹 Love blooms where hope resides,\nTwo souls walking side by side."
                ],
                nature: [
                    "🌿 The forest hums with whispered song,\nWhere trees and rivers both belong.",
                    "🌊 The ocean roars, yet calms the soul,\nA timeless wave, a story whole.",
                    "☀️ The sun awakes, the sky turns gold,\nNature’s beauty never old."
                ],
                life: [
                    "🌻 Life’s a journey, not a race,\nFill the world with love and grace.",
                    "🌍 Each moment shines, a fleeting star,\nReminding us of who we are.",
                    "🕊️ Through trials faced and battles won,\nLife teaches us — we are the sun."
                ],
                motivation: [
                    "🔥 Courage rises, hearts ignite,\nEven shadows fear the light.",
                    "💪 Step by step, the mountain climbs,\nStrength is built through changing times.",
                    "🌟 Dreams demand we never rest,\nFor every trial shapes the best."
                ],
                dreams: [
                    "🌙 The dreamer walks where stars align,\nChasing visions pure, divine.",
                    "✨ In dreams, we find the wings to fly,\nBeyond the limits of the sky.",
                    "💭 The night is soft, the dream is near,\nA whispered hope we hold so dear."
                ]
            };

            // 🌸 Generate extra random poems for "all"
            const subjects = ["The stars", "A river", "The dawn", "Shadows", "The wind", "Dreams", "Love", "Time"];
            const moods = ["whispers", "dances", "sings", "glows", "cries", "smiles"];
            const actions = ["in silence", "with grace", "through the night", "beyond the sky", "deep inside"];
            const places = ["in the heart", "of the soul", "in the dark", "of the world", "within us"];
            
            const randomPoems = [];
            for (let i = 0; i < 100; i++) {
                let s = subjects[Math.floor(Math.random() * subjects.length)];
                let m1 = moods[Math.floor(Math.random() * moods.length)];
                let a = actions[Math.floor(Math.random() * actions.length)];
                let p = places[Math.floor(Math.random() * places.length)];
                randomPoems.push(`✨ ${s} ${m1} ${a},\nFlowing gently ${p}.`);
            }

            // 🎯 Handle args
            if (args[0] && args[0].toLowerCase() === "list") {
                let listMsg = "📜 *Available Poem Categories:*\n\n";
                Object.keys(categories).forEach(cat => {
                    listMsg += `🔹 ${cat}\n`;
                });
                listMsg += `\nUse: *.poem category*\nExample: *.poem love 3*`;
                return await sock.sendMessage(m.key.remoteJid, { text: listMsg }, { quoted: m });
            }

            let category = args[0]?.toLowerCase();
            let count = 1;

            if (args[1] && !isNaN(args[1])) {
                count = Math.min(parseInt(args[1]), 10); // limit max 10
            } else if (args[0] && !isNaN(args[0])) {
                count = Math.min(parseInt(args[0]), 10);
                category = null;
            }

            let poems = [];
            if (category && categories[category]) {
                poems = categories[category];
            } else {
                poems = randomPoems.concat(
                    ...Object.values(categories) // mix with fixed poems
                );
            }

            let selected = [];
            for (let i = 0; i < count; i++) {
                selected.push(poems[Math.floor(Math.random() * poems.length)]);
            }

            await sock.sendMessage(
                m.key.remoteJid,
                { text: selected.join("\n\n") },
                { quoted: m }
            );

        } catch (err) {
            console.error("❌ Error in poem command:", err);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Error while generating poem(s)." },
                { quoted: m }
            );
        }
    }
};
