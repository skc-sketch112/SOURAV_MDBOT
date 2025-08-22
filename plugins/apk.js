const apkpureCrawler = require('apkpure-crawler');
const axios = require('axios');

module.exports = {
  name: "apk",
  command: ["apk", "app", "getapk"],
  category: "tools",
  description: "Search and fetch APK Info from APKPure",
  use: ".apk <appname>",

  execute: async (sock, m, args) => {
    const jid = m?.key?.remoteJid;

    const reply = async (text, extra = {}) =>
      sock.sendMessage(jid, { text, ...extra }, { quoted: m });

    if (!args.length) return reply("❌ Usage: `.apk <app name or package>`");

    const query = args.join(" ");
    await reply(`🔍 Searching APKPure for "${query}"...`);

    try {
      // Use crawler to fetch app info
      const data = await apkpureCrawler.crawlerApkInfo(query, { withVersions: true });
      apkpureCrawler.closeBrowser();

      if (!data || !data.downloadUrl) {
        return reply(`⚠️ No APK found for "${query}".`);
      }

      const { name, downloadUrl, latestVersionName, latestVersionCode, updateDate, shortDescription } = data;

      let msg = `*${name}*\n`;
      msg += `📦 Version: ${latestVersionName} (code ${latestVersionCode})\n`;
      msg += `🆕 Updated: ${updateDate || 'N/A'}\n`;
      msg += `📝 Desc: ${shortDescription || 'N/A'}\n\n`;
      msg += `⬇️ Download: ${downloadUrl}`;

      await reply(msg);
    } catch (err) {
      console.error("apk.js error:", err);
      reply("❌ Failed to fetch APK info. Try again later.");
    }
  }
};
