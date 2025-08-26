const { Module } = require("../main");
const { getBuffer } = require("./utils");
const { fromBuffer } = require("file-type");
const botConfig = require("../config");
const axios = require("axios");

const isFromMe = botConfig.MODE === "public" ? false : true;

Module(
  {
    pattern: "insta ?(.*)",
    fromMe: isFromMe,
    desc: "Instagram post/reel/tv downloader",
    usage: "insta link",
    use: "download",
  },
  async (message, match) => {
    let mediaLink = match[1] || message.reply_message?.text;
    if (!mediaLink) return await message.sendReply("*Need Instagram link*");

    try {
      // 🔥 Your Render API endpoint
      const res = await axios.get(
        `https://instagramapi-fnwz.onrender.com/api/insta?url=${encodeURIComponent(mediaLink)}`
      );

      if (!res.data || !res.data.result || res.data.result.length === 0) {
        return await message.sendReply("*Download failed or no media found!*");
      }

      const quotedMessage = message.reply_message
        ? message.quoted
        : message.data;

      for (const mediaUrl of res.data.result) {
        const mediaBuffer = await getBuffer(mediaUrl);
        const { mime } = await fromBuffer(mediaBuffer);
        await message.sendMessage(
          mediaBuffer,
          mime.includes("video") ? "video" : "image",
          { quoted: quotedMessage }
        );
      }
    } catch (e) {
      console.error(e);
      return await message.sendReply("_Server error, try again later!_");
    }
  }
);
