// plugins/perplexity.js
const axios = require("axios");

module.exports = {
  name: "perplexity",
  alias: ["ask", "pplx", "search"],
  category: "AI", // ✅ Auto menu will put it inside AI section
  desc: "Ask anything from Perplexity AI (answers + sources + images)",
  async execute(sock, msg, args) {
    try {
      if (!args[0]) {
        return sock.sendMessage(
          msg.key.remoteJid,
          { text: "⚠️ Please provide a query!\n\nExample:\n`.perplexity What is quantum computing?`\n`.pplx Generate a cat photo`" },
          { quoted: msg }
        );
      }

      const query = args.join(" ");
      const apiKey = process.env.PERPLEXITY_API_KEY;
      if (!apiKey) {
        return sock.sendMessage(
          msg.key.remoteJid,
          { text: "⚠️ Missing `PERPLEXITY_API_KEY` in env!\n\nGenerate it here:\n👉 https://perplexity.ai/settings/api" },
          { quoted: msg }
        );
      }

      // Detect image intent
      const isImageQuery = /(image|photo|picture|draw|generate)/i.test(query);

      if (isImageQuery) {
        // === Image Query ===
        const response = await axios.post(
          "https://api.perplexity.ai/image", // NOTE: replace with official image endpoint
          { prompt: query },
          { headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" } }
        );

        const imageUrl = response.data?.url || null;
        if (!imageUrl) throw new Error("No image returned!");

        await sock.sendMessage(
          msg.key.remoteJid,
          {
            image: { url: imageUrl },
            caption: `✅ AI generated image for:\n*${query}*`,
          },
          { quoted: msg }
        );
      } else {
        // === Text Query ===
        const response = await axios.post(
          "https://api.perplexity.ai/chat/completions",
          {
            model: "pplx-7b-online", // best live search model
            messages: [{ role: "user", content: query }],
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
          }
        );

        const answer = response.data?.choices?.[0]?.message?.content || "❌ No response.";
        const sources =
          response.data?.sources?.map((s, i) => `🔗 [${i + 1}] ${s.url}`).join("\n") ||
          "⚠️ No sources found";

        await sock.sendMessage(
          msg.key.remoteJid,
          { text: `🤖 *Perplexity Answer:*\n\n${answer}\n\n📚 *Sources:*\n${sources}` },
          { quoted: msg }
        );
      }
    } catch (err) {
      console.error("❌ Perplexity Plugin Error:", err);
      await sock.sendMessage(
        msg.key.remoteJid,
        { text: "⚠️ Failed to fetch from Perplexity. Please try again later." },
        { quoted: msg }
      );
    }
  },
};
