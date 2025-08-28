// insult.js
module.exports = {
  name: "insult",
  command: ["insult", "burn"],
  description: "Randomly insult a tagged user with 60+ savage insults",

  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    // Determine target user
    const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (mentioned.length === 0) {
      return sock.sendMessage(jid, { text: "❌ Please tag someone to insult!" }, { quoted: m });
    }
    const targetUser = mentioned[0];

    // 60+ insults
    const insults = [
      "Your brain is like the Bermuda Triangle—it’s never seen again.",
      "You bring everyone so much joy… when you leave the room.",
      "You have something on your chin… no, the third one down.",
      "You are proof that even evolution takes a break sometimes.",
      "You're as useless as the 'ueue' in 'queue'.",
      "You have the charisma of a damp rag.",
      "You're like a cloud. When you disappear, it’s a beautiful day.",
      "Your secrets are safe with me. I never even listened.",
      "You’re as bright as a black hole and twice as dense.",
      "You're like a software update. Whenever I see you, I think 'Do I really need this right now?'",
      "You are the human embodiment of a typo.",
      "You're like a Slinky: not really good for anything, but you bring a smile when pushed down the stairs.",
      "You have something on your face… oh wait, that’s just your face.",
      "You're like a cloud of mosquitoes: annoying, persistent, and generally unwanted.",
      "Your sense of humor is like Wi-Fi… non-existent in most places.",
      "You’re like a software bug: nobody wants you, but everyone tolerates you.",
      "Your life is like a software license… nobody reads it.",
      "You bring people together… mostly to talk about how weird you are.",
      "You're like a broken pencil… pointless.",
      "You have the attention span of a goldfish on caffeine.",
      "Your face could scare the hiccups out of anyone.",
      "You’re like a Wi-Fi signal in a tunnel… completely useless.",
      "You're proof that even bad ideas can survive.",
      "You're the reason the gene pool needs a lifeguard.",
      "You have the personality of plain toast, but somehow burnt.",
      "You're like Monday mornings… nobody likes you.",
      "Your brain is on airplane mode permanently.",
      "You have the confidence of a cat in a room full of rocking chairs.",
      "You're like a phone with 1% battery… completely unreliable.",
      "You're as sharp as a marble.",
      "Your jokes are like expired milk… they leave everyone feeling sour.",
      "You're like a software license agreement… nobody understands you, but we pretend to.",
      "You have the charm of wet cardboard.",
      "You're like a cloud of dust… everywhere, annoying, invisible impact.",
      "You're as mysterious as a wet sock in summer.",
      "You have the elegance of a pig on roller skates.",
      "You’re like a broken GPS… always leading people nowhere.",
      "You're proof that evolution can go backwards.",
      "You bring the drama of a reality TV show… unnecessarily.",
      "You're as forgettable as last week’s leftover.",
      "Your personality is like decaf coffee… disappointing.",
      "You're like a software error… nobody asked for you.",
      "Your IQ called… it wants a refund.",
      "You're like a meme that died before it was funny.",
      "You have the taste of a plain rice cake.",
      "You’re like a raincloud… everywhere, unwanted, and sad.",
      "Your sense of direction is worse than my Wi-Fi signal.",
      "You're the human equivalent of a participation award.",
      "You have the magnetism of a wet sponge.",
      "You’re like a DVD in a streaming world… outdated and annoying.",
      "Your aura smells like expired milk.",
      "You’re like a password nobody remembers… frustrating and useless.",
      "You have the energy of a sloth on vacation.",
      "You’re like a broken umbrella… supposed to help, but mostly make things worse.",
      "Your fashion sense is a crime against humanity.",
      "You're like a cold soup… nobody asked for it.",
      "You’re the definition of ‘meh’ with a sprinkle of chaos.",
      "Your brain is the size of a peanut… slightly salted.",
      "You have the personality of a soggy napkin.",
      "You're like a flat soda… all fizz gone."
    ];

    // Randomly pick insult
    const insult = insults[Math.floor(Math.random() * insults.length)];

    // Compose message
    const name = targetUser.split("@")[0];
    const replyText = `🔥 @${name}, ${insult}\n\nPowered by SOURAV_,MD`;

    // Send message with tagging
    await sock.sendMessage(
      jid,
      { text: replyText, mentions: [targetUser] },
      { quoted: m }
    );
  }
};
