const axios = require("axios");

module.exports = {
  name: "apk",
  command: ["apk", "app", "getapk"],
  category: "tools",
  description: "Search APK apps & games",
  use: ".apk <appname>",

  execute: async (sock, m, args) => {
    const text = args.join(" ");
    const jid = m?.key?.remoteJid;

    const reply = async (msg) => {
      if (typeof m?.reply === "function") return m.reply(msg);
      return sock.sendMessage(jid, { text: msg }, { quoted: m });
    };

    if (!text) return reply("❌ Please type app name. Example: `.apk whatsapp`");

    try {
      let res = await axios.get(`https://apkpure.com/search?q=${encodeURIComponent(text)}`);
      let html = res.data;

      // Extract app blocks from search page
      const regex = /<a class="dd" href="([^"]+)".*?<img src="([^"]+)".*?<p class="title">([^<]+)<\/p>/gs;
      let match, results = [];

      while ((match = regex.exec(html)) !== null) {
        results.push({
          link: "https://apkpure.com" + match[1],
          icon: match[2],
          name: match[3]
        });
      }

      if (results.length === 0) {
        return reply("⚠️ No results found for: " + text);
      }

      let first = results[0]; // take first result
      let page = await axios.get(first.link);
      let pageHtml = page.data;

      let version = (pageHtml.match(/Version<\/p>\s*<p>([^<]+)/) || [])[1] || "N/A";
      let update = (pageHtml.match(/Update<\/p>\s*<p>([^<]+)/) || [])[1] || "N/A";
      let size = (pageHtml.match(/File Size<\/p>\s*<p>([^<]+)/) || [])[1] || "N/A";

      // Extract download link
      let downloadMatch = pageHtml.match(/href="([^"]+download\?from=details)" class="da/");
      let downloadLink = downloadMatch ? "https://apkpure.com" + downloadMatch[1] : "Not Found";

      let msg = `📱 *${first.name}*\n\n` +
                `🔖 Version: ${version}\n` +
                `📦 Size: ${size}\n` +
                `📅 Updated: ${update}\n\n` +
                `⬇️ [Download Here](${downloadLink})`;

      await sock.sendMessage(jid, {
        image: { url: first.icon },
        caption: msg
      }, { quoted: m });

    } catch (err) {
      console.error("apk.js error:", err);
      reply("❌ Error fetching APK info. Try again later.");
    }
  }
};
