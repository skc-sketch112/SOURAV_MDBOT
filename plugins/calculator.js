module.exports = {
  name: "calculator",
  command: ["calc", "calculator"],
  category: "tools",
  description: "Solve math expressions (unlimited numbers)",
  use: ".calc <expression>",

  execute: async (sock, m, args) => {
    const jid = m?.key?.remoteJid;

    const reply = async (text) => {
      return sock.sendMessage(jid, { text }, { quoted: m });
    };

    if (args.length === 0) {
      return reply("❌ Please enter a math expression.\nExample: `.calc (5000*200)+100`");
    }

    try {
      let expr = args.join(" ");

      // Safe eval (only numbers and operators allowed)
      if (!/^[0-9+\-*/().\s%^]*$/.test(expr)) {
        return reply("⚠️ Invalid expression. Use only numbers and + - * / % ^ ()");
      }

      // Use Function constructor for safe evaluation
      let result = Function(`"use strict"; return (${expr})`)();

      if (result === undefined || isNaN(result)) {
        return reply("⚠️ Could not calculate. Please check your expression.");
      }

      await sock.sendMessage(jid, {
        text: `🧮 *Calculator Result*\n\n📥 Expression: ${expr}\n📤 Result: ${result}`
      }, { quoted: m });

    } catch (err) {
      console.error("calculator.js error:", err);
      reply("❌ Error calculating expression.");
    }
  },
};
