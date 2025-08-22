const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
  name: "url",
  command: ["url", "link", "website"],
  category: "tools",
  description: "Get full info + screenshot of any URL",
  use: ".url <website>",

  execute: async (sock, m, args) => {
    const jid = m?.key?.remoteJid;

    const reply = async (text) => {
      return sock.sendMessage(jid, { text }, { quoted: m });
    };

    if (!args.length) {
      return reply("❌ Please provide a URL.\nExample: `.url https://apkpure.com`");
    }

    let link = args[0];
    if (!/^https?:\/\//i.test(link)) link = "https://" + link; // auto add https

    try {
      // ✅ Check if site is online
      const res = await axios.get(link, { timeout: 10000 });
      const statusCode = res.status;
      const html = res.data;

      // ✅ Parse HTML with cheerio
      const $ = cheerio.load(html);

      const title = $("title").text() || "N/A";
      const desc =
        $('meta[name="description"]').attr("content") ||
        $('meta[property="og:description"]').attr("content") ||
        "No description found.";
      const siteName =
        $('meta[property="og:site_name"]').attr("content") || new URL(link).hostname;
      const favicon =
        $('link[rel="icon"]').attr("href") ||
        $('link[rel="shortcut icon"]').attr("href") ||
        "N/A";

      // Fix favicon if relative
      const faviconUrl =
        favicon && !favicon.startsWith("http")
          ? new URL(favicon, link).href
          : favicon;

      // ✅ Screenshot URL (free API)
      const screenshotUrl = `https://image.thum.io/get/width/800/${link}`;

      let msg = `🌐 *URL Info*\n\n`;
      msg += `🔗 Link: ${link}\n`;
      msg += `📌 Title: ${title}\n`;
      msg += `📝 Description: ${desc}\n`;
      msg += `🏷️ Site: ${siteName}\n`;
      msg += `📶 Status: ${statusCode} (Online)\n`;
      msg += faviconUrl !== "N/A" ? `🖼️ Favicon: ${faviconUrl}\n` : "";

      await sock.sendMessage(
        jid,
        {
          image: { url: screenshotUrl },
          caption: msg,
        },
        { quoted: m }
      );
    } catch (err) {
      console.error("url.js error:", err.message);
      return reply("❌ Failed to fetch URL info. The site may be offline or blocked.");
    }
  },
};
