module.exports = {
  name: "heart_rainbow",
  command: ["rheart", "rainbowheart", "rainbow"],
  description: "Send rainbow heart animation (one-by-one with delays)",

  execute: async (sock, m, args) => {
    try {
      // 🌈 Rainbow palette (only emojis; no network calls)
      const rainbow = ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎"];

      // Optional: user can pass count e.g. ".rheart 12"
      let loops = parseInt(args[0], 10);
      if (isNaN(loops) || loops <= 0) loops = 12;     // default cycles
      if (loops > 25) loops = 25;                     // safety cap

      // Helper: sleep
      const sleep = ms => new Promise(r => setTimeout(r, ms));

      // Start message
      await sock.sendMessage(
        m.key.remoteJid,
        { text: "🌈 Sending Rainbow Heart Vibes..." },
        { quoted: m }
      );

      // Animate: send one line at a time with a wave effect
      // Example output per line: ❤️🧡💛, then 🧡💛💚, then 💛💚💙, etc.
      for (let i = 0; i < loops; i++) {
        const a = i % rainbow.length;
        const line = [
          rainbow[a],
          rainbow[(a + 1) % rainbow.length],
          rainbow[(a + 2) % rainbow.length],
          rainbow[(a + 3) % rainbow.length],
          rainbow[(a + 4) % rainbow.length]
        ].join("");

        await sleep(550); // gentle delay to avoid rate limits
        await sock.sendMessage(
          m.key.remoteJid,
          { text: line },
          { quoted: m }
        );
      }

      // Final rainbow block (single message)
      const block =
        "❤️🧡💛💚💙💜🖤🤍🤎\n" +
        "🧡💛💚💙💜🖤🤍🤎❤️\n" +
        "💛💚💙💜🖤🤍🤎❤️🧡\n" +
        "💚💙💜🖤🤍🤎❤️🧡💛\n" +
        "💙💜🖤🤍🤎❤️🧡💛💚\n" +
        "💜🖤🤍🤎❤️🧡💛💚💙";

      await sock.sendMessage(
        m.key.remoteJid,
        { text: `✨ Rainbow complete!\n\n${block}` },
        { quoted: m }
      );
    } catch (err) {
      console.error("❌ rainbowheart error:", err);
      await sock.sendMessage(
        m.key.remoteJid,
        { text: "⚠️ Failed to send rainbow hearts." },
        { quoted: m }
      );
    }
  }
};
