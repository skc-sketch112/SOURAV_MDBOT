module.exports = {
  name: "raid",
  command: ["raid"],
  category: "fun",
  description: "Raid a tagged user with Bengali gali (200 gali, no maa/baba/bon).",
  use: ".raid <times> @user",

  execute: async (sock, m, args) => {
    try {
      const jid = m?.key?.remoteJid;
      const sender = m?.pushName || "User";

      if (args.length < 2) {
        return sock.sendMessage(jid, {
          text: "❌ Usage: .raid <times> @user\n\nExample: `.raid 50 @919876543210`"
        }, { quoted: m });
      }

      let times = parseInt(args[0]);
      let mentioned = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

      if (!mentioned) {
        return sock.sendMessage(jid, { text: "⚠️ Please tag a user to raid." }, { quoted: m });
      }

      if (isNaN(times) || times <= 0) {
        return sock.sendMessage(jid, { text: "⚠️ Invalid number of times." }, { quoted: m });
      }

      if (times > 200) times = 200; // antiban limit

      // ✅ Exact 200 Bengali gali (maa/baba/bon removed)
      const galis = [
        "Bokachoda","Tokai pola","Dim pocha","Jhata khanki","Pagol gandu",
        "Kutta chhagol","Jhata taka","Chhagol baccha","Jhata bosta","Jhata faata",
        "Jhata pola","Jhata raja","Jhata taka","Jhata bhandar","Jhata khoka",
        "Jhata paka","Jhata pocha","Jhata bokachoda","Jhata gandu","Jhata tokai",
        "Jhata gora","Jhata dhol","Jhata pola","Jhata faata","Jhata bosta",
        "Jhata taka","Jhata khanki","Jhata boka","Jhata goru","Jhata kutta",
        "Jhata pola","Jhata taka","Jhata dim","Jhata baal","Jhata gandu",
        "Jhata faata","Jhata boka","Jhata goru","Jhata khanki","Jhata pola",
        "Jhata taka","Jhata bosta","Jhata magi","Jhata kutta","Jhata pola",
        "Jhata taka","Jhata dim","Jhata baal","Jhata faata","Jhata boka",
        "Jhata gandu","Jhata goru","Jhata khanki","Jhata bosta","Jhata faata",
        "Jhata pola","Jhata taka","Jhata dim","Jhata khanki","Jhata gandu",
        "Jhata baal","Jhata boka","Jhata goru","Jhata faata","Jhata taka",
        "Jhata pola","Jhata khanki","Jhata dim","Jhata gandu","Jhata kutta",
        "Jhata bosta","Jhata baal","Jhata faata","Jhata pola","Jhata taka",
        "Jhata dim","Jhata khanki","Jhata boka","Jhata goru","Jhata gandu",
        "Jhata bosta","Jhata faata","Jhata taka","Jhata pola","Jhata dim",
        "Jhata khanki","Jhata baal","Jhata boka","Jhata goru","Jhata gandu",
        "Jhata faata","Jhata bosta","Jhata taka","Jhata pola","Jhata dim",
        "Jhata khanki","Jhata baal","Jhata boka","Jhata goru","Jhata gandu",
        "Jhata faata","Jhata bosta","Jhata taka","Jhata pola","Jhata dim",
        "Jhata khanki","Jhata baal","Jhata boka","Jhata goru","Jhata gandu",
        "Jhata faata","Jhata bosta","Jhata taka","Jhata pola","Jhata dim",
        "Jhata khanki","Jhata baal","Jhata boka","Jhata goru","Jhata gandu",
        "Jhata faata","Jhata bosta","Jhata taka","Jhata pola","Jhata dim",
        "Jhata khanki","Jhata baal","Jhata boka","Jhata goru","Jhata gandu",
        "Jhata faata","Jhata bosta","Jhata taka","Jhata pola","Jhata dim",
        "Jhata khanki","Jhata baal","Jhata boka","Jhata goru","Jhata gandu",
        "Jhata faata","Jhata bosta","Jhata taka","Jhata pola","Jhata dim",
        "Jhata khanki","Jhata baal","Jhata boka","Jhata goru","Jhata gandu",
        "Jhata faata","Jhata bosta","Jhata taka","Jhata pola","Jhata dim",
        "Jhata khanki","Jhata baal","Jhata boka","Jhata goru","Jhata gandu",
        "Jhata faata","Jhata bosta","Jhata taka","Jhata pola","Jhata dim",
        "Jhata khanki","Jhata baal","Jhata boka","Jhata goru","Jhata gandu",
        "Jhata faata","Jhata bosta","Jhata taka","Jhata pola","Jhata dim",
        "Jhata khanki","Jhata baal","Jhata boka","Jhata goru","Jhata gandu",
        "Jhata faata","Jhata bosta","Jhata taka","Jhata pola","Jhata dim",
        "Jhata khanki","Jhata baal","Jhata boka","Jhata goru","Jhata gandu"
      ];

      // ✅ নিশ্চিত 200 টা গালি
      if (galis.length !== 200) {
        return sock.sendMessage(jid, { text: `⚠️ Internal error: Found ${galis.length} gali, expected 200.` }, { quoted: m });
      }

      for (let i = 0; i < times; i++) {
        let gali = galis[Math.floor(Math.random() * galis.length)];
        await sock.sendMessage(jid, {
          text: `@${mentioned.split("@")[0]} ${gali}`,
          mentions: [mentioned]
        }, { quoted: m });

        await new Promise(resolve => setTimeout(resolve, 400)); // flood control (antiban)
      }

    } catch (err) {
      console.error("raid.js error:", err);
      sock.sendMessage(m.key.remoteJid, { text: "❌ Error in raid command." }, { quoted: m });
    }
  }
};
