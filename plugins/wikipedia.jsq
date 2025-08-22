const fetch = require("node-fetch");

/**
 * Wikipedia plugin
 * Commands:
 *   .wiki <query>
 *   .wikipedia <query>
 * Options:
 *   -lang:<code>  -> e.g. .wiki -lang:hi रामायण
 */
module.exports = {
  name: "wikipedia",
  command: ["wiki", "wikipedia", "wikisearch"],
  description: "Unlimited Wikipedia search with long results, image & related links",

  execute: async (sock, m, args, invoked) => {
    const jid = m.key.remoteJid;

    // ---- Parse language option ----
    let lang = "en";
    const langIdx = args.findIndex(a => /^-lang:/i.test(a));
    if (langIdx !== -1) {
      const code = args[langIdx].split(":")[1]?.trim();
      if (code) lang = code.toLowerCase();
      args.splice(langIdx, 1);
    }

    const query = args.join(" ").trim();
    if (!query) {
      await sock.sendMessage(
        jid,
        {
          text:
`📚 *Wikipedia Search*
Usage:
• .wiki <topic>
• .wiki -lang:hi रामायण
• .wiki -lang:bn রবীন্দ্রনাথ ঠাকুর`
        },
        { quoted: m }
      );
      return;
    }

    try {
      // 1) Search for best title
      const searchApi = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srlimit=1&srsearch=${encodeURIComponent(query)}&utf8=1&format=json&origin=*`;
      const sRes = await safeFetch(searchApi, 12000);
      if (!sRes.ok) throw new Error("Search request failed");
      const sJson = await sRes.json();
      const title = sJson?.query?.search?.[0]?.title;

      // 2) If no title found, try REST summary directly with the raw query
      let finalTitle = title || query;

      // 3) Fetch summary (for thumbnail + short desc)
      const summaryUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(finalTitle)}`;
      let summary = null;
      try {
        const sumRes = await safeFetch(summaryUrl, 12000);
        if (sumRes.ok) summary = await sumRes.json();
      } catch (_) {}

      // 4) Fetch full extract (big text, plain)
      const extractUrl =
        `https://${lang}.wikipedia.org/w/api.php?` +
        `action=query&prop=extracts&explaintext=1&exsectionformat=plain&redirects=1&format=json&origin=*&titles=${encodeURIComponent(finalTitle)}`;
      let extractText = "";
      try {
        const exRes = await safeFetch(extractUrl, 15000);
        if (exRes.ok) {
          const exJson = await exRes.json();
          const pages = exJson?.query?.pages || {};
          const firstKey = Object.keys(pages)[0];
          extractText = pages[firstKey]?.extract || "";
        }
      } catch (_) {}

      // 5) If extract empty, fallback to REST extract
      if (!extractText && summary?.extract) {
        extractText = summary.extract;
      }

      // 6) Build header + link
      const pageTitle = summary?.title || finalTitle;
      const pageUrl = summary?.content_urls?.desktop?.page ||
                      `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, "_"))}`;
      const desc = summary?.description ? `_${summary.description}_\n` : "";
      const header =
`🧠 *Wikipedia* (${lang.toUpperCase()})
*${pageTitle}*
${desc}${pageUrl}`;

      // 7) Related topics (up to 5)
      let relatedBlock = "";
      try {
        const relUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/related/${encodeURIComponent(pageTitle)}`;
        const relRes = await safeFetch(relUrl, 10000);
        if (relRes.ok) {
          const rel = await relRes.json();
          const items = (rel?.pages || []).slice(0, 5);
          if (items.length) {
            relatedBlock =
              "\n\n🔎 *Related:*\n" +
              items.map(i => `• ${i.titles?.normalized || i.title} — https://${lang}.wikipedia.org/wiki/${encodeURIComponent((i.titles?.normalized || i.title || "").replace(/ /g, "_"))}`).join("\n");
          }
        }
      } catch (_) {}

      // 8) Nothing found?
      if (!extractText && !summary) {
        await sock.sendMessage(jid, { text: `❌ No results for “${query}” on ${lang.toUpperCase()} Wikipedia.` }, { quoted: m });
        return;
      }

      // 9) Send thumbnail (if any) with intro caption
      const intro = `${header}\n\n${extractText ? sliceByWords(extractText, 700) : ""}`;
      const thumb = summary?.thumbnail?.source;

      if (thumb) {
        await sock.sendMessage(
          jid,
          { image: { url: thumb }, caption: intro },
          { quoted: m }
        );
      } else {
        await sock.sendMessage(jid, { text: intro }, { quoted: m });
      }

      // 10) Send remaining text in safe chunks
      if (extractText && extractText.length > 700) {
        const rest = extractText.slice(sliceByWords(extractText, 700).length);
        const chunks = chunkText(rest, 3500);
        for (let i = 0; i < chunks.length; i++) {
          const partTag = chunks.length > 1 ? ` (part ${i + 1}/${chunks.length})` : "";
          await sock.sendMessage(jid, { text: chunks[i] }, { quoted: m });
        }
      }

      // 11) Send related section (if any)
      if (relatedBlock) {
        await sock.sendMessage(jid, { text: relatedBlock }, { quoted: m });
      }

    } catch (err) {
      console.error("❌ Wikipedia plugin error:", err);
      await sock.sendMessage(jid, { text: "⚠️ Could not fetch Wikipedia right now. Please try again." }, { quoted: m });
    }
  }
};

/* ---------------- Helpers ---------------- */

async function safeFetch(url, timeoutMs = 10000) {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": "Mozilla/5.0 (WikiBot)" } });
  } finally {
    clearTimeout(tid);
  }
}

// Return a slice up to maxLen ending on word boundary
function sliceByWords(text, maxLen) {
  if (text.length <= maxLen) return text;
  const slice = text.slice(0, maxLen);
  const lastSpace = slice.lastIndexOf(" ");
  return lastSpace > 200 ? slice.slice(0, lastSpace) : slice; // avoid chopping too early
}

// Split long text into <= maxLen chunks without breaking words
function chunkText(text, maxLen = 3500) {
  const chunks = [];
  let remaining = text.trim();
  while (remaining.length > maxLen) {
    const piece = sliceByWords(remaining, maxLen);
    chunks.push(piece.trim());
    remaining = remaining.slice(piece.length).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}
