const axios = require("axios");

module.exports = {
  name: "perplexity",
  alias: ["ask", "ai", "polx"],
  desc: "Ask anything like Perplexity AI (text + optional image)",
  category: "AI",
  async execute(sock, m, args) {
    try {
      const query = args.join(" ");
      if (!query) {
        return sock.sendMessage(m.chat, { 
          text: "❌ Please type your question.\n\nExample: .perplexity Who is Elon Musk?" 
        }, { quoted: m });
      }

      // 🔑 Text AI response
      const textRes = await axios.post(
        "https://api-inference.huggingface.co/models/google/flan-t5-large",
        { inputs: query },
        { headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` } }
      );

      const answer = textRes.data[0]?.generated_text || "❌ No response, try again.";

      // 🔑 Optional Image Generation (Stable Diffusion)
      let imageBuffer = null;
      try {
        const imgRes = await axios.post(
          "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2",
          { inputs: query },
          {
            headers: { 
              Authorization: `Bearer ${process.env.HF_API_KEY}`,
              "Content-Type": "application/json"
            },
            responseType: "arraybuffer"
          }
        );
        imageBuffer = Buffer.from(imgRes.data, "binary");
      } catch (err) {
        console.log("⚠️ Image generation failed, skipping...");
      }

      // Send answer
      await sock.sendMessage(m.chat, { 
        text: `🤖 *Perplexity Pro (Free)*\n\n📌 *Question:* ${query}\n\n💡 *Answer:* ${answer}`
      }, { quoted: m });

      // Send image if available
      if (imageBuffer) {
        await sock.sendMessage(m.chat, { 
          image: imageBuffer, 
          caption: `🎨 *AI Generated Image for:* ${query}` 
        }, { quoted: m });
      }

    } catch (err) {
      console.error("Perplexity command error:", err);
      await sock.sendMessage(m.chat, { text: "⚠️ Error fetching response from AI." }, { quoted: m });
    }
  }
};
