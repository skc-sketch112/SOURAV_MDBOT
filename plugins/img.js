const axios = require("axios");

module.exports = {
  name: "img",
  command: ["img", "image", "imagine", "imagesearch"],
  description: "Fetch images from multiple sources with exact keyword match",

  async execute(sock, m, args) {
    const query = args.join(" ");
    if (!query) return await sock.sendMessage(
      m.key.remoteJid,
      { text: "⚠️ Provide a keyword!\nExample: `.img virat kohli`" },
      { quoted: m }
    );

    const jid = m.key.remoteJid;

    // ===== Animated Loader in the SAME MESSAGE =====
    let loaderMsg = await sock.sendMessage(jid, { text: "🔍 Finding images... ⏳" }, { quoted: m });
    const loaderFrames = ["⏳", "⌛", "🔄", "🔃"];
    let frameIndex = 0;

    const loaderInterval = setInterval(async () => {
      try {
        await sock.sendMessage(jid, { text: `🔍 Finding images... ${loaderFrames[frameIndex % loaderFrames.length]}` }, { quoted: loaderMsg });
        frameIndex++;
      } catch {}
    }, 800); // 0.8s frame change

    let urls = [];
    const timeout = 8000;

    const fetchFromAPI = async (url, headers = {}, parser = data => []) => {
      try {
        const res = await axios.get(url, { headers, timeout });
        return parser(res.data);
      } catch (err) {
        console.error(`API fetch failed: ${url}`, err.message);
        return [];
      }
    };

    // ===== Multiple Sources =====
    // Unsplash
    urls.push(...await fetchFromAPI(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=15`,
      { Authorization: "Client-ID Uebb0QGhkVela_0V0ZidmqYXDqAEHRYpV2UnemVHgLY" },
      data => data.results.map(img => img.urls?.regular).filter(Boolean)
    ));

    // Pexels
    urls.push(...await fetchFromAPI(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15`,
      { Authorization: "YOUR_PEXELS_API_KEY" },
      data => data.photos.map(img => img.src?.original).filter(Boolean)
    ));

    // DuckDuckGo
    urls.push(...await fetchFromAPI(
      `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`,
      {},
      data => {
        const regex = /"image":"(.*?)"/g;
        const results = [];
        let match;
        while ((match = regex.exec(data)) !== null) results.push(match[1].replace(/\\u0026/g, "&"));
        return results;
      }
    ));

    // Pixabay
    urls.push(...await fetchFromAPI(
      `https://pixabay.com/api/?key=YOUR_PIXABAY_API_KEY&q=${encodeURIComponent(query)}&per_page=15`,
      {},
      data => data.hits.map(img => img.webformatURL).filter(Boolean)
    ));

    // ===== Deduplicate & limit =====
    urls = [...new Set(urls)].slice(0, 5);

    clearInterval(loaderInterval); // stop loader animation

    if (urls.length === 0) {
      return await sock.sendMessage(jid, { text: `❌ No images found for *${query}*.` }, { quoted: m });
    }

    // ===== Edit loader message to show success =====
    await sock.sendMessage(jid, { text: `🎉 I have got something w8🔥🚀` }, { quoted: m });

    // ===== Send images concurrently =====
    await Promise.all(urls.map((img, i) =>
      sock.sendMessage(jid, {
        image: { url: img },
        caption: `✨ ${query} #${i + 1}\n\nPowered by SOURAV`
      }, { quoted: m }).catch(err => console.error("Send image error:", err.message))
    ));

    console.log(`✅ Sent ${urls.length} images for query: ${query}`);
  }
};
