// plugins/gita.js
// Works with Node 20+ (native fetch). If you're on older Node, install `node-fetch` and uncomment the import.
// const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const BASE = 'https://vedicscriptures.github.io';

module.exports = {
  name: 'gita',
  command: ['gita', 'bg', 'gitaverse', 'bhagavadgita'],
  help: `.gita <ch> <sl>  → specific verse
.gita random       → random verse
.gita chapters     → list all chapters
.gita chapter <n>  → chapter summary`,

  execute: async (sock, m, args) => {
    const jid = m.key.remoteJid;

    // tiny helpers
    const send = (text, opts = {}) => sock.sendMessage(jid, { text, ...opts }, { quoted: m });
    const num = (s) => Number.isFinite(+s) ? +s : NaN;

    try {
      if (!args.length) {
        return send(
          `📖 *Bhagavad Gita*\n\n` +
          `Use:\n${module.exports.help}\n\n` +
          `Example: *.gita 2 47*`
        );
      }

      // ---- subcommands ----
      const sub = args[0].toLowerCase();

      if (sub === 'chapters') {
        // list 1..18 with verse counts
        const lines = [];
        for (let ch = 1; ch <= 18; ch++) {
          const info = await getChapter(ch);
          lines.push(`${ch}. ${safeName(info)} — ${info?.verses_count || '?'} verses`);
        }
        return send(`🗂️ *Chapters of the Gita*\n\n${lines.join('\n')}`);
      }

      if (sub === 'chapter') {
        const ch = num(args[1]);
        if (!ch || ch < 1 || ch > 18) {
          return send(`⚠️ Give a valid chapter number 1–18.\nExample: *.gita chapter 12*`);
        }
        const info = await getChapter(ch);
        if (!info) return send(`❌ Couldn’t fetch chapter ${ch}. Try again later.`);
        const title = `📘 *Chapter ${ch}* — ${safeName(info)}`;
        const summaryEn = info?.summary?.en || '—';
        const summaryHi = info?.summary?.hi || null;
        return send(
          `${title}\n\n📝 *Summary (EN)*:\n${summaryEn}` +
          (summaryHi ? `\n\n📝 *Summary (HI)*:\n${summaryHi}` : '')
        );
      }

      if (sub === 'random') {
        const ch = 1 + Math.floor(Math.random() * 18);
        const info = await getChapter(ch);
        const total = info?.verses_count || 47; // fallback
        const sl = 1 + Math.floor(Math.random() * total);
        const data = await getSlok(ch, sl);
        if (!data) return send(`❌ Couldn’t fetch a random verse. Try again.`);
        return send(formatVerse(data));
      }

      // ---- numeric: .gita <chapter> <verse> ----
      const ch = num(args[0]);
      const sl = num(args[1]);
      if (!ch || !sl) {
        return send(`⚠️ Usage: *.gita <chapter> <verse>*\nExample: *.gita 2 47*`);
      }
      if (ch < 1 || ch > 18) {
        return send(`⚠️ Chapter must be between 1 and 18.`);
      }
      // validate verse exists by checking chapter info
      const info = await getChapter(ch);
      const max = info?.verses_count || 0;
      if (!max) return send(`❌ Couldn’t validate verses for chapter ${ch}. Try again.`);
      if (sl < 1 || sl > max) {
        return send(`⚠️ Chapter ${ch} has ${max} verses. You asked for ${sl}.`);
      }

      const data = await getSlok(ch, sl);
      if (!data) return send(`❌ Couldn’t fetch BG ${ch}.${sl}. Try again.`);
      return send(formatVerse(data));

    } catch (err) {
      console.error('gita plugin error:', err);
      return send(`❌ Error fetching Bhagavad Gita. Please try again later.`);
    }
  }
};

// ---------------- helpers ----------------

async function getChapter(ch) {
  try {
    const res = await fetch(`${BASE}/chapter/${ch}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function getSlok(ch, sl) {
  try {
    const res = await fetch(`${BASE}/slok/${ch}/${sl}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function safeName(info) {
  // name may be a plain string or an object with en/hi etc.
  const nm = info?.name;
  if (!nm) return '—';
  if (typeof nm === 'string') return nm;
  return nm.en || nm.hi || nm.sanskrit || '—';
}

function pickEnglish(d) {
  // try common translator keys with English translation `et`
  const candidates = ['siva', 'gambir', 'san', 'adi', 'purohit'];
  for (const k of candidates) {
    const v = d?.[k];
    if (v?.et) return `${v.et}`.trim();
  }
  return null;
}

function pickHindi(d) {
  // Swami Tejomayananda (ht) or Chinmayananda (hc)
  const tej = d?.tej?.ht && String(d.tej.ht).trim();
  if (tej) return tej;
  const chin = d?.chinmay?.hc && String(d.chinmay.hc).trim();
  if (chin) return chin;
  return null;
}

function formatVerse(d) {
  const ch = d.chapter;
  const sl = d.verse;
  const slok = (d.slok || '').trim();
  const translit = (d.transliteration || '').trim();
  const en = pickEnglish(d);
  const hi = pickHindi(d);

  let out = `🕉️ *Bhagavad Gita* — BG ${ch}.${sl}\n\n`;
  if (slok) out += `📜 *Sanskrit*\n${slok}\n\n`;
  if (translit) out += `🔤 *Transliteration*\n_${translit}_\n\n`;
  if (en) out += `🌍 *English*\n${en}\n\n`;
  if (hi) out += `🇮🇳 *Hindi*\n${hi}\n\n`;
  out += `🔗 Source: vedicscriptures.github.io`;
  return out.trim();
    }
