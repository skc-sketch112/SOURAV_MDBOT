module.exports = {
  name: "raid",
  command: ["raid"],
  category: "fun",
  description: "Spam raid with Bengali gali",
  use: ".raid <count> @user",

  execute: async (sock, m, args) => {
    try {
      const jid = m?.key?.remoteJid;
      const count = parseInt(args[0]);
      const mention = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

      if (!count || !mention) {
        return sock.sendMessage(jid, { text: "❌ Usage: .raid <count> @user" }, { quoted: m });
      }

      // Bengali gali list (exact 200)
      const galiList = [
        "Bokachoda", "Khankir chele", "Tui ek numberer haramjada", "khanki magi",
        "Pagolchoda", "Chagolchoda", "Gadhachudi", "Shuorer baccha", "Tui chagolchudi", "Pagol chagol er gud",
        "Narkel matha r bichi", "Bodna mukh r bal", "Faltu lokchoda", "Andha pagolgudmarani", "Shala bokachoda",
        "gudkhor haramkhor", "Shuorer matha", "Fokat chele r dhon chosh", "Lafanga", "Bokachoda sala r kuttar maal fhele chudbo",
        "Tor matha baje", "Tui haramjada gud gud gud khoi", "Faltu bacchachoda", "Pagol er baccha", "Chhagoler bacchachudi",
        "Harami lok", "Dhur bokachoda", "Thakla bokachoda", "Tor matha kharap mathai bichi ache", "Pagolchoda chele",
        "Faltu chagol", "Narkel matha chagol", "Matha noshto", "Andha gadha", "Useless bokachoda",
        "Tor matha potol gud r dhon", "Lafanga chagol", "Dhur tor khobor ache gud der tolai", "Pagol bokachoda", "Shala lafanga",
        "Tor matha gondogol", "Khankir baccha", "Pagol gadha", "Chhagoler matha", "Tor mukh baje",
        "Tor gare gondogol ache", "Haramjada bokachoda", "Tor matha dhoa", "lanto chele", "Faltu gadha",
        "Narkel pagol", "Tor matha uthche na nicher bichii", "Pagol lafanga", "Andha bokachoda", "Tor mukh dhoa amr maal",
        "Tor matha noshto", "Pagol harami", "Khankir baccha bokachoda", "Tor gondogol matha", "Faltu chhagol",
        "Pagol useless", "Dhur tor matha", "Tor matha dim", "Tor pagol chele", "Tor matha uthche",
        "Faltu useless", "Andha useless", "Tor matha lafanga", "Pagol useless lok", "Tor matha bokachoda",
        "Pagol useless chele", "Tor mukh useless", "Baje useless", "Faltu useless lok", "Tor matha useless",
        "Pagol chhagol useless", "Tor useless matha", "Tor useless bokachoda", "Pagol useless bokachoda",
        "Andha useless bokachoda", "Tor useless chele", "Faltu useless baccha", "Pagol useless lafanga", "Tor useless gadha",
        "Pagol useless gadha", "Useless useless", "Tor useless harami", "Pagol useless haramjada", "Tor useless pagol",
        "Pagol useless pagol", "Tor useless lafanga", "Faltu useless haramkhor", "Tor useless baje", "Pagol useless baje",
        "Tor useless useless", "Tor useless lafanga chagol", "Pagol useless useless", "Tor useless useless bokachoda",
        "Faltu useless useless", "Tor useless useless gadha", "Pagol useless useless gadha", "Tor useless useless pagol",
        "Tor useless useless harami", "Pagol useless useless haramjada", "Tor useless useless chhagol", "Pagol useless useless chhagol",
        "Tor useless useless lafanga", "Pagol useless useless lafanga", "Tor useless useless matha", "Pagol useless useless matha",
        "Tor useless useless useless", "Pagol useless useless useless", "Faltu useless useless useless", "Tor useless useless useless bokachoda",
        "Tor useless useless useless gadha", "Pagol useless useless useless gadha", "Tor useless useless useless pagol", "Pagol useless useless useless pagol",
        "Tor useless useless useless harami", "Pagol useless useless useless haramjada", "Tor useless useless useless chhagol", "Pagol useless useless useless chhagol",
        "Tor useless useless useless lafanga", "Pagol useless useless useless lafanga", "Tor useless useless useless matha", "Pagol useless useless useless matha",
        "Tor useless useless useless useless", "Pagol useless useless useless useless", "Tor useless useless useless useless bokachoda", "Pagol useless useless useless useless bokachoda",
        "Tor useless useless useless useless gadha", "Pagol useless useless useless useless gadha", "Tor useless useless useless useless pagol", "Pagol useless useless useless useless pagol",
        "Tor useless useless useless useless harami", "Pagol useless useless useless useless haramjada", "Tor useless useless useless useless chhagol", "Pagol useless useless useless useless chhagol",
        "Tor useless useless useless useless lafanga", "Pagol useless useless useless useless lafanga", "Tor useless useless useless useless matha", "Pagol useless useless useless useless matha",
        "Tor useless useless useless useless useless", "Pagol useless useless useless useless useless", "Tor useless useless useless useless useless bokachoda", "Pagol useless useless useless useless useless bokachoda",
        "Tor useless useless useless useless useless gadha", "Pagol useless useless useless useless useless gadha", "Tor useless useless useless useless useless pagol", "Pagol useless useless useless useless useless pagol",
        "Tor useless useless useless useless useless harami", "Pagol useless useless useless useless useless haramjada", "Tor useless useless useless useless useless chhagol", "Pagol useless useless useless useless useless chhagol",
        "Tor useless useless useless useless useless lafanga", "Pagol useless useless useless useless useless lafanga", "Tor useless useless useless useless useless matha", "Pagol useless useless useless useless useless matha",
        "Bokachoda", "Pagol er dudh", "Gadha modu", "Chagol er dhon", "Lafanga gudirbeta", "Khankirchele", "Haramjada ", "Baje lok gud chud pud", "Faltu choda", "tor tits khule criket khelbo"
      ];

      if (galiList.length !== 168) {
        return sock.sendMessage(jid, { text: `⚠️ Internal error: Found ${galiList.length}, expected 168.` }, { quoted: m });
      }

      for (let i = 0; i < count; i++) {
        const gali = galiList[Math.floor(Math.random() * galiList.length)];
        await sock.sendMessage(
          jid,
          { text: `@${mention.split("@")[0]} ${gali}`, mentions: [mention] },
          { quoted: m }
        );
      }
    } catch (err) {
      console.error("raid.js error:", err);
      sock.sendMessage(m.key.remoteJid, { text: "❌ Error in raid plugin." }, { quoted: m });
    }
  },
};
