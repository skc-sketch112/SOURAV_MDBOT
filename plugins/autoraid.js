const gali = [
  "bokachoda","haramjada","pagol er baccha","kharap chele","khanki bacha","kukur er mota",
  "shala pagol","tor pet e gondho","tor matha noshto","andho goru","beshorom","pagla chagol",
  "tor kotha kalo goru","haddi boka","boka jamai","tor chokh bondho","gadha","dimag kharap",
  "pagla meye","pagla chhele","tor dimag jal","chhagoler baccha","dimag choto","pakhir matha",
  "pagol shala","kichir michir goru","tor chul pora","beshorom chagol","tui kukur","dimag heen",
  "bokachoda pro max","pagol er jamai","dimag zero","tor matha fata","bokachoda unlimited",
  "dimag damage","boka pagol","tor kotha goru","pagla dim","gadha shala","bokachoda 420",
  "pagla pagal","tor jibon fail","tor mukh gondho","tor matha futi","bokachoda boss",
  "kharap pagol","tor mukh baje","tor dimag futi","beshorom boss","bokachoda ultimate",
  "pagla damri","tor matha jole","pagla ghoda","tor mukh kalo","bokachoda unlimited edition",
  "pagol master","tor matha chhagol","dimag fuchka","tor mukh goru","bokachoda prime",
  "tor chokh noshto","pagol generator","tor mukh fail","pagla biscuit","bokachoda galaxy",
  "tor matha biscuit","pagol radio","bokachoda sun","tor chokh andho","dimag chhagol",
  "tor mukh kola","bokachoda moon","pagol tv","tor mukh fuchka","bokachoda sky",
  "tor chokh fail","pagol radio live","bokachoda planet","tor mukh chhagol","bokachoda mars",
  "pagol box","tor mukh fail unlimited","bokachoda star","pagol lol","tor mukh water",
  "bokachoda king","tor chokh zero","pagol blast","bokachoda ultra","tor mukh blast",
  "bokachoda dragon","pagol fire","tor mukh blast fail","bokachoda devil","tor mukh devil",
  "pagol noshto","bokachoda joker","tor mukh pagol","bokachoda 007","tor chokh kalo",
  "pagol 111","tor mukh ghoda","bokachoda beast","pagol rakhal","tor mukh noshto",
  "bokachoda hacker","pagol zero","tor mukh gola","bokachoda hacker pro","tor chokh glass",
  "pagol fail","bokachoda 100%","tor mukh jhamela","pagol 404","tor matha notun",
  "bokachoda XD","tor mukh 101","pagol ABC","bokachoda lol","tor mukh pagla",
  "pagol ultimate","bokachoda hero","tor mukh 111","pagol baka","bokachoda sad",
  "tor mukh broken","pagol fish","bokachoda gadha","tor mukh gadha","pagol horse",
  "bokachoda baka","tor mukh baka","pagol kachra","bokachoda beta","tor mukh fail beta",
  "pagol biscuit fail","bokachoda copy","tor mukh copy fail","pagol noob","bokachoda noob",
  "tor mukh noob","pagol bot","bokachoda bot","tor mukh bot fail","pagol hacker",
  "bokachoda hacker fail","tor mukh hacker","pagol virus","bokachoda virus","tor mukh virus",
  "pagol clown","bokachoda clown","tor mukh clown","pagol joker","bokachoda joker fail",
  "tor mukh joker fail","pagol chhagol","bokachoda chhagol","tor mukh chhagol fail",
  "pagol master fail","bokachoda master","tor mukh master fail","pagol devil",
  "bokachoda devil fail","tor mukh devil fail","pagol beast","bokachoda beast fail",
  "tor mukh beast fail","pagol goru","bokachoda goru","tor mukh goru fail","pagol goru fail"
]; // 168 total

let raidTarget = null;
let isRaiding = false;

module.exports = {
  name: "autoraid",
  alias: ["autoraid","stopraid"],
  description: "AutoRaid with 168 Bengali gali",
  async run(m, { sock, body, sender, args }) {
    if (body.startsWith(".autoraid")) {
      const target = args[0];
      if (!target) {
        await sock.sendMessage(m.chat, { text: "❌ Tag/number dite hobe!" });
        return;
      }
      raidTarget = target.replace("@", "").replace(/\D/g, "");
      isRaiding = true;
      await sock.sendMessage(m.chat, {
        text: `🔥 AutoRaid started on @${raidTarget}`,
        mentions: [raidTarget + "@s.whatsapp.net"],
      });
    }

    if (body.startsWith(".stopraid")) {
      isRaiding = false;
      raidTarget = null;
      await sock.sendMessage(m.chat, { text: "✅ AutoRaid stopped." });
    }

    if (isRaiding && raidTarget && sender.includes(raidTarget)) {
      const randomGali = gali[Math.floor(Math.random() * gali.length)];
      await sock.sendMessage(m.chat, {
        text: `@${raidTarget} ${randomGali}`,
        mentions: [raidTarget + "@s.whatsapp.net"],
      });
    }
  },
};
