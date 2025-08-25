let math;
try {
  math = require("mathjs"); // make sure to install: npm install mathjs@11.11.0
} catch (e) {
  console.error("⚠️ mathjs not installed. Run: npm install mathjs@11.11.0");
}

module.exports = {
  name: "calculator",
  command: ["calc", "calculator"],
  category: "tools",
  description: "Ultra-level calculator (supports complex, big numbers, √, ×, ÷, ^, %, !, etc.)",
  use: ".calc <expression>",

  execute: async (sock, m, args) => {
    const jid = m?.key?.remoteJid;

    const reply = (text) =>
      sock.sendMessage(jid, { text }, { quoted: m });

    if (!args.length) {
      return reply(
        "❌ Please enter a math expression.\n" +
        "Example:\n" +
        "`.calc (5000×200) + √100`\n" +
        "`.calc sin(45 deg) + cos(60 deg)`\n" +
        "`.calc 25! ÷ (5^2)`"
      );
    }

    if (!math) {
      return reply("⚠️ Calculator not available. Please install `mathjs@11.11.0`.");
    }

    try {
      let expr = args.join(" ")
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/√/g, "sqrt")
        .replace(/π/g, "pi")
        .replace(/e/g, "e"); // natural constant

      // Evaluate safely
      const result = math.evaluate(expr);

      let formattedResult;
      if (typeof result === "number") {
        // Handle large / precise numbers
        formattedResult = math.format(result, { precision: 14 });
      } else {
        // For matrix, complex, big numbers, etc.
        formattedResult = result.toString();
      }

      await sock.sendMessage(jid, {
        text: `🧮 *Ultra Calculator*\n\n📥 Expression:\n\`${expr}\`\n\n📤 Result:\n\`${formattedResult}\``
      }, { quoted: m });

    } catch (err) {
      console.error("calculator.js error:", err);
      reply("❌ Error calculating expression. Please check your input.");
    }
  },
};
