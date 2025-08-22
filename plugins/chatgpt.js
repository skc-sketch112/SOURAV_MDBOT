const fetch = require("node-fetch");

/**
 * AI plugin with multi-provider support + keyless fallback.
 *
 * Env vars (set any ONE and it will be used):
 *  - OPENAI_API_KEY
 *  - OPENROUTER_API_KEY
 *  - TOGETHER_API_KEY
 *  - DEEPSEEK_API_KEY
 *  - HUGGINGFACE_API_KEY
 *
 * Usage:
 *  .ai what is quantum entanglement?
 *  .ask write a poem about monsoon in Goa
 *  .gpt -max:1200 summarize https://en.wikipedia.org/wiki/Quantum_entanglement
 */

module.exports = {
  name: "ai",
  command: ["ai", "ask", "gpt"],
  description: "ChatGPT-like answers with multi-provider fallback & keyless mode",

  execute: async (sock, m, args, invoked) => {
    const jid = m.key.remoteJid;

    // Parse options
    let maxOut = 1800; // characters per message chunk
    let maxTokens = 800; // provider token limit hint (if supported)
    const raw = args.join(" ").trim();
    if (!raw) {
      await sock.sendMessage(jid, { text: helpText(invoked) }, { quoted: m });
      return;
    }

    // optional -max:<number> to control output chunk size
    const maxMatch = raw.match(/-max:(\d+)/i);
    if (maxMatch) {
      maxOut = Math.max(500, Math.min(4000, parseInt(maxMatch[1], 10)));
    }
    const prompt = raw.replace(/-max:\d+/i, "").trim();

    try {
      const provider = pickProvider();
      let answer = "";

      if (provider) {
        answer = await askLLM({
          provider,
          prompt,
          maxTokens
        });
      } else {
        // No keys -> free fallback mode (Wikipedia + Google News RSS)
        answer = await freeFallback(prompt);
      }

      if (!answer || !answer.trim()) {
        await sock.sendMessage(jid, { text: "⚠️ I couldn’t produce an answer right now. Please try again." }, { quoted: m });
        return;
      }

      // chunk long responses so WhatsApp doesn’t truncate
      const chunks = chunkText(answer, maxOut);
      for (const [i, ch] of chunks.entries()) {
        const tag = chunks.length > 1 ? `\n\n— part ${i + 1}/${chunks.length}` : "";
        await sock.sendMessage(jid, { text: ch + tag }, { quoted: m });
      }
    } catch (err) {
      console.error("❌ AI plugin error:", err);
      await sock.sendMessage(jid, { text: "⚠️ Error getting the answer. Try again later." }, { quoted: m });
    }
  }
};

/* ---------------- Provider Picker ---------------- */

function pickProvider() {
  if (process.env.OPENAI_API_KEY) {
    return { name: "openai", key: process.env.OPENAI_API_KEY, model: process.env.OPENAI_MODEL || "gpt-4o-mini" };
  }
  if (process.env.OPENROUTER_API_KEY) {
    // Good free/cheap models via OpenRouter (pick one or let users set OPENROUTER_MODEL)
    return { name: "openrouter", key: process.env.OPENROUTER_API_KEY, model: process.env.OPENROUTER_MODEL || "meta-llama/llama-3.1-70b-instruct" };
  }
  if (process.env.TOGETHER_API_KEY) {
    return { name: "together", key: process.env.TOGETHER_API_KEY, model: process.env.TOGETHER_MODEL || "meta-llama/Llama-3-70b-chat-hf" };
  }
  if (process.env.DEEPSEEK_API_KEY) {
    return { name: "deepseek", key: process.env.DEEPSEEK_API_KEY, model: process.env.DEEPSEEK_MODEL || "deepseek-chat" };
  }
  if (process.env.HUGGINGFACE_API_KEY) {
    // Will use a text-generation-inference endpoint behind the scenes
    return { name: "huggingface", key: process.env.HUGGINGFACE_API_KEY, model: process.env.HF_MODEL || "mistralai/Mixtral-8x7B-Instruct-v0.1" };
  }
  return null; // no keys -> fallback mode
}

/* ---------------- LLM Ask ---------------- */

async function askLLM({ provider, prompt, maxTokens = 800 }) {
  const sys = "You are a helpful, concise assistant. Write clear, well-structured answers. Use bullet points when helpful. Include examples where appropriate.";
  switch (provider.name) {
    case "openai": {
      const url = "https://api.openai.com/v1/chat/completions";
      const body = {
        model: provider.model,
        messages: [
          { role: "system", content: sys },
          { role: "user", content: prompt }
        ],
        max_tokens: maxTokens,
        temperature: 0.7
      };
      const res = await safeFetch(url, 20000, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${provider.key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      return json?.choices?.[0]?.message?.content || "";
    }

    case "openrouter": {
      const url = "https://openrouter.ai/api/v1/chat/completions";
      const body = {
        model: provider.model,
        messages: [
          { role: "system", content: sys },
          { role: "user", content: prompt }
        ],
        max_tokens: maxTokens,
        temperature: 0.7
      };
      const res = await safeFetch(url, 25000, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${provider.key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      return json?.choices?.[0]?.message?.content || "";
    }

    case "together": {
      const url = "https://api.together.xyz/v1/chat/completions";
      const body = {
        model: provider.model,
        messages: [
          { role: "system", content: sys },
          { role: "user", content: prompt }
        ],
        max_tokens: maxTokens,
        temperature: 0.7
      };
      const res = await safeFetch(url, 25000, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${provider.key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      return json?.choices?.[0]?.message?.content || "";
    }

    case "deepseek": {
      const url = "https://api.deepseek.com/chat/completions";
      const body = {
        model: provider.model,
        messages: [
          { role: "system", content: sys },
          { role: "user", content: prompt }
        ],
        max_tokens: maxTokens,
        temperature: 0.7
      };
      const res = await safeFetch(url, 25000, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${provider.key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      return json?.choices?.[0]?.message?.content || "";
    }

    case "huggingface": {
      const url = `https://api-inference.huggingface.co/models/${encodeURIComponent(provider.model)}`;
      const body = {
        inputs: `System: ${sys}\nUser: ${prompt}\nAssistant:`,
        parameters: { max_new_tokens: maxTokens, temperature: 0.7, return_full_text: false }
      };
      const res = await safeFetch(url, 30000, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${provider.key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      // HF returns array or object depending on backend
      if (Array.isArray(json) && json[0]?.generated_text) return json[0].generated_text;
      if (json?.generated_text) return json.generated_text;
      // TGI style
      if (Array.isArray(json) && json[0]?.generated_text) return json[0].generated_text;
      return extractHFText(json);
    }
  }
  return "";
}

function extractHFText(obj) {
  if (!obj) return "";
  if (Array.isArray(obj)) {
    for (const it of obj) {
      if (it?.generated_text) return it.generated_text;
      if (it?.generated_texts?.length) return it.generated_texts.join("\n");
    }
  }
  if (obj?.generated_text) return obj.generated_text;
  if (obj?.choices?.[0]?.text) return obj.choices[0].text;
  return "";
}

/* ---------------- Keyless Fallback Mode ---------------- */

async function freeFallback(query) {
  // Strategy:
  // 1) Try Wikipedia summary
  // 2) If not enough, append top Google News RSS headlines on that topic
  // 3) Return combined, readable answer
  let out = "";

  const wiki = await wikipediaSummary(query);
  if (wiki) {
    out += `📚 *Wikipedia Summary*\n${wiki}\n`;
  }

  const news = await googleNewsTop(query);
  if (news && news.length) {
    out += `\n📰 *Latest Headlines*\n` +
      news.slice(0, 6).map((n, i) => ` ${i + 1}. ${n.title}\n    ${n.link}`).join("\n");
  }

  if (!out) {
    out = "I couldn’t find enough information without an AI provider key. Please try a different query or add any one API key (OPENAI_API_KEY / OPENROUTER_API_KEY / TOGETHER_API_KEY / DEEPSEEK_API_KEY / HUGGINGFACE_API_KEY).";
  }
  return out.trim();
}

async function wikipediaSummary(q, lang = "en") {
  try {
    // Search best title
    const sURL = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srlimit=1&srsearch=${encodeURIComponent(q)}&utf8=1&format=json&origin=*`;
    const sRes = await safeFetch(sURL, 10000);
    if (!sRes.ok) return "";
    const sJson = await sRes.json();
    const title = sJson?.query?.search?.[0]?.title || q;

    const sumURL = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const r = await safeFetch(sumURL, 10000);
    if (!r.ok) return "";
    const j = await r.json();
    const extract = j?.extract || "";
    if (!extract) return "";
    return `*${j.title}*\n${extract}\n🔗 ${j?.content_urls?.desktop?.page || `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`}`;
  } catch {
    return "";
  }
}

async function googleNewsTop(topic) {
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(topic)}&hl=en-IN&gl=IN&ceid=IN:en`;
    const res = await safeFetch(url, 10000);
    if (!res.ok) return [];
    const xml = await res.text();
    const items = [...xml.matchAll(/<item><title><!\[CDATA\[(.*?)\]\]><\/title><link>(.*?)<\/link>/g)]
      .map(m => ({ title: decodeEntities(m[1]), link: m[2] }));
    return items;
  } catch {
    return [];
  }
}

function decodeEntities(s = "") {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/* ---------------- Utils ---------------- */

function chunkText(text, maxLen = 1800) {
  const chunks = [];
  let t = text.trim();
  while (t.length > maxLen) {
    const slice = t.slice(0, maxLen);
    const cut = slice.lastIndexOf("\n");
    const end = cut > 600 ? cut : slice.lastIndexOf(" ");
    const idx = end > 400 ? end : maxLen;
    chunks.push(t.slice(0, idx).trim());
    t = t.slice(idx).trim();
  }
  if (t) chunks.push(t);
  return chunks;
}

async function safeFetch(url, timeoutMs = 15000, init = {}) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal, headers: { "User-Agent": "SOURAV_MD-Bot/1.0", ...(init.headers || {}) } });
    return res;
  } finally {
    clearTimeout(id);
  }
}

function helpText(invoked = "ai") {
  return (
`🤖 *AI Assistant*
Use like ChatGPT. Supports multiple providers; also works in free keyless mode.

*Examples*
• .${invoked} Explain quantum entanglement
• .${invoked} Draft an apology email for delivery delay
• .${invoked} -max:1200 Summarize https://en.wikipedia.org/wiki/India

*Tip:* Set one of these env vars for best answers:
OPENAI_API_KEY / OPENROUTER_API_KEY / TOGETHER_API_KEY / DEEPSEEK_API_KEY / HUGGINGFACE_API_KEY`
  );
}
