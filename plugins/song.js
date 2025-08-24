const { youtubedlv2 } = require("yt-dlp-exec");
const fs = require("fs");
const path = require("path");
const yts = require("yt-search");

module.exports = {
    name: "song",
    command: ["song", "play", "music"],
    execute: async (sock, m, args) => {
        if (!args[0]) {
            return sock.sendMessage(m.key.remoteJid, { text: "❌ Please provide a song name or YouTube link." }, { quoted: m });
        }

        let query = args.join(" ");
        let videoUrl, videoInfo;

        // If user gives a YouTube link
        if (query.includes("youtube.com") || query.includes("youtu.be")) {
            videoUrl = query;
            let search = await yts({ videoId: videoUrl.split("v=")[1] });
            videoInfo = search;
        } else {
            // Otherwise search by song name
            let search = await yts(query);
            if (!search.videos.length) {
                return sock.sendMessage(m.key.remoteJid, { text: "⚠️ No results found!" }, { quoted: m });
            }
            videoInfo = search.videos[0];
            videoUrl = videoInfo.url;
        }

        try {
            // 📌 Send preview card first
            await sock.sendMessage(m.key.remoteJid, {
                image: { url: videoInfo.thumbnail },
                caption: `🎶 *Song Found!*\n\n` +
                         `📌 *Title:* ${videoInfo.title}\n` +
                         `🎤 *Channel:* ${videoInfo.author.name}\n` +
                         `⏱️ *Duration:* ${videoInfo.timestamp}\n` +
                         `👁️ *Views:* ${videoInfo.views.toLocaleString()}\n` +
                         `🔗 *Link
