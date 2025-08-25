const { parse, evaluate, format } = require("mathjs");

module.exports = {
  name: "calculator",
  command: ["calc", "calculator"],
  category: "tools",
  description: "Ultra Scientific Calculator – step-by-step math solver",
  use: ".calc <expression>",

  execute: async (sock, m, args) => {
    const jid = m?.key?.remoteJid;

    const reply = async (text) => {
      return sock.sendMessage(jid, { text }, { quoted: m });
    };

    if (args.length === 0) {
      return reply(
        "❌ Please enter a math expression.\n\n" +
        "Examples:\n" +
        "`.calc (5000×200) + √144`\n" +
        "`.calc (12^2 + 5) ÷ (√16)`\n" +
        "`.calc sin(90 deg) + cos(0)`\n" +
        "`.calc log(1000,10)`"
      );
    }

    try {
      let expr = args.join(" ");

      // Replace math symbols for mathjs
      expr = expr
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/√/g, "sqrt")
        .replace(/π/g, "pi")
        .replace(/\be\b/g, "e");

      // Parse expression for steps
      const node = parse(expr);
      const simplified = node.toString(); // mathjs simplification
      const result = evaluate(expr);

      // Step-by-step breakdown (recursive walk of the tree)
      let steps = [];
      function walk(node, depth = 0) {
        if (node.args) {
          node.args.forEach(arg => walk(arg, depth + 1));
        }
        steps.push("➤ " + " ".repeat(depth * 2) + node.toString());
      }
      walk(node);

      await sock.sendMessage(
        jid,
        {
          text:
            `🧮 *Ultra Scientific Calculator*\n\n` +
            `📥 *Input:* ${args.join(" ")}\n\n` +
            `🔍 *Simplified:* ${simplified}\n\n` +
            `📑 *Steps:*\n${steps.join("\n")}\n\n` +
            `📤 *Final Result:* ${format(result, { precision: 14 })}`
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("calculator.js error:", err.message);
      reply("⚠️ Invalid math expression. Please check and try again.");
    }
  },
};
