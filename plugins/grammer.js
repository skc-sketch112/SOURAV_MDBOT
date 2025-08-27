// grammar.js - Grammar correction with inline suggestions + corrected text
const fetch = require("node-fetch");

const LT_API_URL = "https://api.languagetool.org/v2/check";

module.exports = {
  name: "grammar",
  command: ["grammer", "grammar"],
  description: "Correct grammar instantly with suggestions + corrected text.",

  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;

    try {
      let text = args.join(" ").trim();

      // If replying to a message, use quoted text
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (quoted) {
        if (quoted.conversation) text = quoted.conversation;
        else if (quoted.extendedTextMessage?.text) text = quoted.extendedTextMessage.text;
      }

      if (!text) {
        return sock.sendMessage(jid, {
          text: "⚠️ Please provide text or reply to a message.\nUsage: `.grammer I has a apple`"
        }, { quoted: msg });
      }

      // Call LanguageTool API
      const params = new URLSearchParams();
      params.append("text", text);
      params.append("language", "en-US");

      const res = await fetch(LT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString()
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data = await res.json();
      const matches = data.matches || [];

      if (matches.length === 0) {
        return sock.sendMessage(jid, { text: "✅ No grammar issues found." }, { quoted: msg });
      }

      // Build inline suggestions
      let suggestions = `✅ *Grammar Suggestions:* (${matches.length})\n\n`;
      let correctedText = text;
      let offsetFix = 0;

      for (let i = 0; i < matches.length; i++) {
        const m = matches[i];
        const wrong = text.substr(m.offset, m.length);
        const suggestion = m.replacements?.[0]?.value || "(no suggestion)";
        suggestions += `• "${wrong}" → "${suggestion}" (${m.message})\n`;

        // Apply corrections to final text
        if (m.replacements && m.replacements[0]) {
          const start = m.offset + offsetFix;
          const end = start + m.length;
          correctedText =
            correctedText.slice(0, start) +
            m.replacements[0].value +
            correctedText.slice(end);

          // Adjust offset because replacement length may differ
          offsetFix += m.replacements[0].value.length - m.length;
        }
      }

      const finalOutput =
        `${suggestions}\n\n✅ *Corrected Text:*\n${correctedText}`;

      await sock.sendMessage(jid, { text: finalOutput }, { quoted: msg });

    } catch (err) {
      console.error("Grammar error:", err);
      await sock.sendMessage(jid, {
        text: `❌ Grammar check failed: ${err.message}`
      }, { quoted: msg });
    }
  }
};
