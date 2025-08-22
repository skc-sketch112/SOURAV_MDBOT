const { Configuration, OpenAIApi } = require("openai");

module.exports = {
  name: "poem",
  command: ["poem", "poetry"],
  category: "fun",
  description: "Generate unlimited poems",
  use: ".poem <topic>",

  execute: async (sock, m, args) => {
    const text = args.join(" ");
    const jid = m?.key?.remoteJid;

    const reply = async (msg) => {
      if (typeof m?.reply === "function") return m.reply(msg);
      return sock.sendMessage(jid, { text: msg }, { quoted: m });
    };

    if (!text) return reply("❌ Please provide a topic. Example: `.poem love`");

    try {
      const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY, // put your OpenAI key in Render Environment Variables
      });
      const openai = new OpenAIApi(configuration);

      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",  // you can use "gpt-4" if you have access
        messages: [
          { role: "system", content: "You are a skilled poet who writes deep, beautiful, and creative poems." },
          { role: "user", content: `Write a long, meaningful, and beautiful poem about: ${text}` }
        ],
        max_tokens: 500,  // long poems
        temperature: 0.9, // more creativity
      });

      let poem = response.data.choices[0].message.content;

      await sock.sendMessage(jid, { text: poem }, { quoted: m });

    } catch (err) {
      console.error("poem.js error:", err);
      reply("❌ Error generating poem. Make sure your `OPENAI_API_KEY` is set in environment variables.");
    }
  }
};
