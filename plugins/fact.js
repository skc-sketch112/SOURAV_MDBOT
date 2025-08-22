const fetch = require("node-fetch");

module.exports = {
    name: "fact",
    command: ["fact", "facts", "funfact"],
    description: "Get random fun facts by category",

    execute: async (sock, m, args) => {
        try {
            let category = args[0]?.toLowerCase() || "random";
            let fact = "";

            switch (category) {
                case "science":
                    {
                        const res = await fetch("https://science-facts-api.vercel.app/api/v1/facts");
                        const data = await res.json();
                        fact = data?.fact || "⚠️ Couldn't fetch a science fact.";
                    }
                    break;

                case "animal":
                    {
                        // Pick random animal
                        const animals = ["dog", "cat", "panda", "fox"];
                        const chosen = animals[Math.floor(Math.random() * animals.length)];
                        const res = await fetch(`https://some-random-api.com/facts/${chosen}`);
                        const data = await res.json();
                        fact = data?.fact || `⚠️ Couldn't fetch a ${chosen} fact.`;
                    }
                    break;

                case "history":
                    {
                        const res = await fetch("https://history.muffinlabs.com/date");
                        const data = await res.json();
                        if (data?.data?.Events?.length > 0) {
                            const rand = data.data.Events[Math.floor(Math.random() * data.data.Events.length)];
                            fact = `On this day in ${rand.year}: ${rand.text}`;
                        } else {
                            fact = "⚠️ Couldn't fetch a history fact.";
                        }
                    }
                    break;

                default:
                    {
                        const res = await fetch("https://uselessfacts.jsph.pl/random.json?language=en");
                        const data = await res.json();
                        fact = data?.text || "⚠️ Couldn't fetch a random fact.";
                    }
                    break;
            }

            // 🎨 Stylish response
            const msg = `
📘 *Did You Know?* 📘

💡 ${fact}

📌 *Category*: ${category.charAt(0).toUpperCase() + category.slice(1)}

⚡ Stay curious, stay smart!
`;

            await sock.sendMessage(m.key.remoteJid, { text: msg }, { quoted: m });
        } catch (err) {
            console.error("❌ Fact error:", err);
            await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Failed to fetch fact. Try again later." }, { quoted: m });
        }
    },
};
