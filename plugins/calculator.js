const { evaluate } = require("mathjs");
const mathsteps = require("mathsteps");

module.exports = {
  name: "calculator",
  command: ["calc", "calculate", "math", "solve"],
  category: "tools",
  description: "Solve any math expression with step-by-step solution",
  use: ".calc <expression>",

  execute: async (sock, m, args) => {
    const jid = m?.key?.remoteJid;

    const reply = async (text) => {
      return sock.sendMessage(jid, { text }, { quoted: m });
    };

    if (!args.length) {
      return reply("❌ Please provide a math expression.\nExample: `.calc (12+8)*3^2`");
    }

    const expr = args.join(" ");

    try {
      // ✅ Step 1: Direct calculation with mathjs
      const result = evaluate(expr);

      // ✅ Step 2: Try generating step-by-step using mathsteps
      let stepsText = "";
      try {
        const steps = mathsteps.simplifyExpression(expr);
        if (steps.length > 0) {
          stepsText = "\n\n📘 *Step-by-Step*:\n";
          steps.forEach((step, i) => {
            stepsText += `👉 Step ${i + 1}: ${step.changeType}\n   ${step.oldNode.toString()} ➝ ${step.newNode.toString()}\n`;
          });
        }
      } catch (e) {
        stepsText = "\nℹ️ No step-by-step available for this expression.";
      }

      // ✅ Final reply
      return reply(
        `🧮 *CALCULATOR*\n\n📥 Expression: ${expr}\n📤 Result: ${result}${stepsText}`
      );

    } catch (err) {
      console.error("calc error:", err.message);
      return reply("❌ Invalid expression. Try again.\nExample: `.calc (12+8)*3^2`");
    }
  }
};
