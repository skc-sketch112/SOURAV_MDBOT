const fetch = require("node-fetch");

module.exports = {
  name: "fact",
  command: ["fact", "facts", "funfact"],
  description: "Get unlimited random facts by category (science, animal, history, random)",

  execute: async (sock, m, args) => {
    try {
      let cat = args[0]?.toLowerCase() || "random";
      let fact = "";

      if (cat === "science") {
        const res = await fetch("https://uselessfacts.jsph.pl/category/Science.json?language=en");
        const data = await res.json();
        fact = data?.text || "Couldn't fetch science fact.";
      } else if (cat === "animal") {
        const res = await fetch("https://uselessfacts.jsph.pl/category/Animals.json?language=en");
        const data = await res.json();
        fact = data?.text || "Couldn't fetch animal fact.";
      } else if (cat === "history") {
        const res = await fetch("https://uselessfacts.jsph.pl/category/History.json?language=en");
        const data = await res.json();
        fact = data?.text || "Couldn't fetch history fact.";
      } else {
        const res = await fetch("https://uselessfacts.jsph.pl/random.json?language=en");
        const data = await res.json();
        fact = data?.text || "Couldn't fetch random fact.";
      }

      const msg = `
📚 *Fun Fact* — *${cat.charAt(0).toUpperCase() + cat.slice(1)}*

❝ ${fact} ❞

_Stay curious!_
`;

      await sock.sendMessage(m.key.remoteJid, { text: msg }, { quoted: m });
    } catch (err) {
      console.error("❌ Fact error:", err);
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Failed to fetch fact. Try again later." }, { quoted: m });
    }
  },
};
