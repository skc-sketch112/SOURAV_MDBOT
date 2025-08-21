// plugins/mantra.js
// Hindu mantras plugin with random option

const mantras = {
  gayatri: {
    title: "🌞 Gayatri Mantra",
    mantra: `ॐ भूर् भुवः स्वः  
तत्सवितुर्वरेण्यं  
भर्गो देवस्य धीमहि  
धियो यो नः प्रचोदयात् ॥`,
    english: `Om Bhur Bhuvah Swaha  
Tat Savitur Varenyam  
Bhargo Devasya Dheemahi  
Dhiyo Yo Nah Prachodayat`
  },

  mahamrityunjaya: {
    title: "🕉️ Mahamrityunjaya Mantra",
    mantra: `ॐ त्र्यम्बकं यजामहे  
सुगन्धिं पुष्टिवर्धनम् ।  
उर्वारुकमिव बन्धनान्  
मृत्योर्मुक्षीय मामृतात् ॥`,
    english: `Om Tryambakam Yajamahe  
Sugandhim Pushtivardhanam  
Urvarukamiva Bandhanan  
Mrityor Mukshiya Maamritat`
  },

  hanuman: {
    title: "💪 Hanuman Mantra",
    mantra: `ॐ हनुमते नमः ॥`,
    english: `Om Hanumate Namah`
  },

  ganesh: {
    title: "🐘 Ganesh Mantra",
    mantra: `ॐ गं गणपतये नमः ॥`,
    english: `Om Gam Ganapataye Namah`
  },

  saraswati: {
    title: "📚 Saraswati Mantra",
    mantra: `ॐ ऐं सरस्वत्यै नमः ॥`,
    english: `Om Aim Saraswatyai Namah`
  },

  lakshmi: {
    title: "💰 Lakshmi Mantra",
    mantra: `ॐ श्रीं महालक्ष्म्यै नमः ॥`,
    english: `Om Shreem Mahalakshmyai Namah`
  },

  durga: {
    title: "🗡️ Durga Mantra",
    mantra: `ॐ दुं दुर्गायै नमः ॥`,
    english: `Om Dum Durgayai Namah`
  },

  vishnu: {
    title: "🪔 Vishnu Mantra",
    mantra: `ॐ नमो नारायणाय ॥`,
    english: `Om Namo Narayanaya`
  },

  shiva: {
    title: "🔱 Shiva Mantra",
    mantra: `ॐ नमः शिवाय ॥`,
    english: `Om Namah Shivaya`
  },

  rama: {
    title: "🏹 Rama Mantra",
    mantra: `ॐ श्री रामाय नमः ॥`,
    english: `Om Shri Ramaya Namah`
  },

  krishna: {
    title: "🎶 Krishna Mantra",
    mantra: `ॐ नमो भगवते वासुदेवाय ॥`,
    english: `Om Namo Bhagavate Vasudevaya`
  }
};

module.exports = {
  name: "mantra",
  command: ["mantra", "mantras"],
  description: "Get Hindu mantras by name or random",
  usage: ".mantra [name|random]",
  execute: async (sock, m, args) => {
    const jid = m.key.remoteJid;
    const key = args[0]?.toLowerCase();

    if (!key) {
      // Show menu of all mantras
      let menu = "🙏 *Available Mantras* 🙏\n\n";
      Object.keys(mantras).forEach((k) => {
        menu += `✨ ${mantras[k].title} → .mantra ${k}\n`;
      });
      menu += `\n🎲 Random mantra → .mantra random`;
      await sock.sendMessage(jid, { text: menu }, { quoted: m });
      return;
    }

    if (key === "random") {
      const keys = Object.keys(mantras);
      const randKey = keys[Math.floor(Math.random() * keys.length)];
      const chosen = mantras[randKey];
      const text = `*${chosen.title}*\n\n${chosen.mantra}\n\n_${chosen.english}_`;
      await sock.sendMessage(jid, { text }, { quoted: m });
      return;
    }

    if (!mantras[key]) {
      await sock.sendMessage(jid, { text: `⚠️ Unknown mantra. Type .mantra to see the list.` }, { quoted: m });
      return;
    }

    const chosen = mantras[key];
    const text = `*${chosen.title}*\n\n${chosen.mantra}\n\n_${chosen.english}_`;
    await sock.sendMessage(jid, { text }, { quoted: m });
  }
};
