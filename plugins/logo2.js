Here are the two JavaScript files formatted in the style you requested.
logo2.js
const axios = require("axios");
const cheerio = require("cheerio"); // For PhotoOxy API

/*
 * Advanced Logo Command with Multi-API Fallback
 * API 1: PhotoOxy (Primary)
 * API 2: TextPro (Fallback)
 * Features: 35+ styles, improved help command, robust error handling.
 */

// Helper function for PhotoOxy API
async function createPhotoOxy(url, text) {
  try {
    const response = await axios.post(
      url,
      `text_1=${encodeURIComponent(text)}&login=OK`,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    const $ = cheerio.load(response.data);
    const resultUrl = $("div.thumbnail a").attr("href");
    if (!resultUrl)
      throw new Error("Could not find image URL from PhotoOxy response.");
    return resultUrl;
  } catch (error) {
    throw new Error(`PhotoOxy API Error: ${error.message}`);
  }
}

// Helper function for TextPro API
async function createTextPro(url, text) {
  try {
    // Step 1: Get the token and session cookies
    const home = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36",
      },
    });
    const $ = cheerio.load(home.data);
    const token = $("#token").val();
    const build_server = $("#build_server").val();
    const build_server_id = $("#build_server_id").val();
    const cookies = home.headers["set-cookie"].join("; ");

    // Step 2: Post the text to generate the image
    const post = await axios.post(
      "https://textpro.me/effect/create-effect",
      new URLSearchParams({
        "text[]": text,
        submit: "Go",
        token,
        build_server,
        build_server_id,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36",
          Cookie: cookies,
        },
      }
    );

    const result = post.data;
    if (!result || !result.fullsize_image)
      throw new Error("Could not get image URL from TextPro response.");

    return `https://textpro.me${result.fullsize_image}`;
  } catch (error) {
    throw new Error(`TextPro API Error: ${error.message}`);
  }
}

module.exports = {
  name: "logo2",
  command: ["logo2", "logov2", "textlogo"],
  description: "Generate 35+ realistic text logos with a reliable multi-API system.",

  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    const [style, ...textArr] = args;
    const text = textArr.join(" ");

    // ✅ List of 35+ supported styles with their API and URL/effect
    const styles = {
      // --- PhotoOxy API Styles ---
      shadow: {
        api: "photooxy",
        url: "https://photooxy.com/logo-and-text-effects/shadow-text-effect-in-the-sky-394.html",
      },
      cup: {
        api: "photooxy",
        url: "https://photooxy.com/logo-and-text-effects/write-text-on-the-cup-392.html",
      },
      romantic: {
        api: "photooxy",
        url: "https://photooxy.com/logo-and-text-effects/romantic-messages-for-your-loved-one-391.html",
      },
      burnpaper: {
        api: "photooxy",
        url: "https://photooxy.com/logo-and-text-effects/write-text-on-burn-paper-388.html",
      },
      smoke: {
        api: "photooxy",
        url: "https://photooxy.com/other-design/create-an-easy-smoke-type-effect-390.html",
      },
      naruto: {
        api: "photooxy",
        url: "https://photooxy.com/manga-and-anime/make-naruto-logo-style-for-your-name-379.html",
      },
      lovemsg: {
        api: "photooxy",
        url: "https://photooxy.com/logo-and-text-effects/create-a-picture-of-love-message-377.html",
      },
      grass: {
        api: "photooxy",
        url: "https://photooxy.com/logo-and-text-effects/make-quotes-under-grass-376.html",
      },
      glow: {
        api: "photooxy",
        url: "https://photooxy.com/logo-and-text-effects/make-smoky-neon-glow-effect-343.html",
      },
      sweet: {
        api: "photooxy",
        url: "https://photooxy.com/logo-and-text-effects/sweet-andy-text-online-368.html",
      },
      wood: {
        api: "photooxy",
        url: "https://photooxy.com/logo-and-text-effects/carved-wood-effect-online-365.html",
      },
      // --- TextPro API Styles ---
      neon: {
        api: "textpro",
        url: "https://textpro.me/create-a-futuristic-technology-neon-light-text-effect-1006.html",
      },
      blackpink: {
        api: "textpro",
        url: "https://textpro.me/create-blackpink-logo-style-online-1001.html",
      },
      joker: {
        api: "textpro",
        url: "https://textpro.me/create-joker-logo-online-free-1046.html",
      },
      metallic: {
        api: "textpro",
        url: "https://textpro.me/create-a-metallic-text-effect-free-online-1041.html",
      },
      thor: {
        api: "textpro",
        url: "https://textpro.me/create-thor-logo-style-text-effect-online-1064.html",
      },
      harrypotter: {
        api: "textpro",
        url: "https://textpro.me/create-harry-potter-text-effect-online-1025.html",
      },
      pornhub: {
        api: "textpro",
        url: "https://textpro.me/pornhub-style-logo-online-generator-free-977.html",
      },
      avengers: {
        api: "textpro",
        url: "https://textpro.me/create-3d-avengers-logo-online-974.html",
      },
      marvel: {
        api: "textpro",
        url: "https://textpro.me/create-logo-style-marvel-studios-online-971.html",
      },
      glitch: {
        api: "textpro",
        url: "https://textpro.me/create-a-glitch-text-effect-online-free-1026.html",
      },
      water: {
        api: "textpro",
        url: "https://textpro.me/create-a-3d-glossy-water-text-effect-online-1066.html",
      },
      ice: {
        api: "textpro",
        url: "https://textpro.me/ice-cold-text-effect-862.html",
      },
      stone: {
        api: "textpro",
        url: "https://textpro.me/3d-stone-cracked-cool-text-effect-1029.html",
      },
      space: {
        api: "textpro",
        url: "https://textpro.me/create-space-3d-text-effect-online-985.html",
      },
      magma: {
        api: "textpro",
        url: "https://textpro.me/create-a-magma-hot-text-effect-online-1030.html",
      },
      sand: {
        api: "textpro",
        url: "https://textpro.me/sand-writing-text-effect-online-990.html",
      },
      cloud: {
        api: "textpro",
        url: "https://textpro.me/create-a-cloud-text-effect-on-the-sky-online-1004.html",
      },
      demon: {
        api: "textpro",
        url: "https://textpro.me/create-green-horror-style-text-effect-online-1036.html",
      },
      transformer: {
        api: "textpro",
        url: "https://textpro.me/create-a-transformer-text-effect-online-1035.html",
      },
      berry: {
        api: "textpro",
        url: "https://textpro.me/create-berry-text-effect-online-free-1033.html",
      },
      thunder: {
        api: "textpro",
        url: "https://textpro.me/online-thunder-text-effect-generator-1031.html",
      },
      carbon: {
        api: "textpro",
        url: "https://textpro.me/carbon-text-effect-833.html",
      },
      blood: {
        api: "textpro",
        url: "https://textpro.me/blood-text-on-the-frosted-glass-941.html",
      },
      toxic: {
        api: "textpro",
        url: "https://textpro.me/toxic-text-effect-online-901.html",
      },
    };

    if (!style || !text) {
      const styleList = Object.keys(styles)
        .map((s) => `• ${s}`)
        .join("\n");
      const helpText = `⚠️ কমান্ড ভুলভাবে ব্যবহার করা হয়েছে।\n\n*ব্যবহারের নিয়ম:*\n.logo2 <style> <text>\n\n*উদাহরণ:*\n.logo2 neon Hello World\n\n*উপলব্ধ স্টাইলসমূহ:*\n${styleList}`;
      return await sock.sendMessage(jid, { text: helpText }, { quoted: m });
    }

    const selectedStyle = styles[style.toLowerCase()];

    if (!selectedStyle) {
      const styleList = Object.keys(styles).join(", ");
      return await sock.sendMessage(
        jid,
        { text: `❌ এই স্টাইলটি পাওয়া যায়নি!\n\n*উপলব্ধ স্টাইল:* ${styleList}` },
        { quoted: m }
      );
    }

    await sock.sendMessage(
      jid,
      {
        text: `⏳ আপনার *${style.toUpperCase()}* লোগো তৈরি করা হচ্ছে... অনুগ্রহ করে অপেক্ষা করুন।`,
      },
      { quoted: m }
    );

    let imageUrl;
    try {
      // --- Primary API Attempt ---
      if (selectedStyle.api === "photooxy") {
        imageUrl = await createPhotoOxy(selectedStyle.url, text);
      } else {
        // Fallback to TextPro by default
        imageUrl = await createTextPro(selectedStyle.url, text);
      }

      if (!imageUrl)
        throw new Error("Image URL not found after API processing.");

      await sock.sendMessage(
        jid,
        {
          image: { url: imageUrl },
          caption: `✨ আপনার *${style.toUpperCase()}* স্টাইলের লোগো তৈরি!\n\n📝 লেখা: *${text}*`,
        },
        { quoted: m }
      );
    } catch (err) {
      console.error("Logo2 Main Error:", err.message);
      // --- Final Fallback Error Message ---
      await sock.sendMessage(
        jid,
        {
          text: `❌ দুঃখিত, লোগো তৈরি করতে একটি সমস্যা হয়েছে।\n\n*কারণ:* ${err.message}\n\nঅনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন অথবা অন্য কোনো স্টাইল ব্যবহার করুন।`,
        },
        { quoted: m }
      );
    }
  },
};

warn.js
const fs = require('fs');
const warnPath = './warnData.json';
const settingsPath = './warnSettings.json';

module.exports = {
    name: "warn",
    command: ["warn"],
    execute: async (sock, m, args) => {
        try {
            const groupJid = m.key.remoteJid;
            const senderId = m.sender;

            // Admin/owner only
            const groupMetadata = await sock.groupMetadata(groupJid);
            const senderParticipant = groupMetadata.participants.find(p => p.id === senderId);
            const senderAdmin = senderParticipant?.admin;
            const isOwner = groupMetadata.owner === senderId;

            if (!senderAdmin && !isOwner) {
                return await sock.sendMessage(groupJid, { text: "❌ Only admin/owner can warn!" }, { quoted: m });
            }

            if (!args[0]) {
                return await sock.sendMessage(groupJid, { text: "⚠️ Usage: `.warn @user`" }, { quoted: m });
            }

            let mention = m.mentionedJid && m.mentionedJid[0];
            if (!mention) {
                return await sock.sendMessage(groupJid, { text: "❌ Mention a user to warn!" }, { quoted: m });
            }

            // Check warn system
            let settings = {};
            if (fs.existsSync(settingsPath)) {
                settings = JSON.parse(fs.readFileSync(settingsPath));
            }
            
            if (!settings[groupJid] || !settings[groupJid].active) {
                return await sock.sendMessage(groupJid, { text: "❌ Warn system is OFF!" }, { quoted: m });
            }

            const limit = settings[groupJid].limit || 3;

            // Load warn data
            let data = {};
            if (fs.existsSync(warnPath)) {
                data = JSON.parse(fs.readFileSync(warnPath));
            }

            if (!data[groupJid]) {
                data[groupJid] = {};
            }
            if (!data[groupJid][mention]) {
                data[groupJid][mention] = 0;
            }

            // Increment warn
            data[groupJid][mention] += 1;
            fs.writeFileSync(warnPath, JSON.stringify(data, null, 2));

            let warnCount = data[groupJid][mention];
            let text = `⚠️ <@${mention.split("@")[0]}> has been warned!\nTotal warns: ${warnCount}/${limit}`;

            // Auto action if limit reached
            if (warnCount >= limit) {
                try {
                    await sock.groupParticipantsUpdate(groupJid, [mention], "remove"); // Kick user
                    text += `\n❌ Limit reached! User has been kicked.`;
                    delete data[groupJid][mention]; // Reset warn after action
                    fs.writeFileSync(warnPath, JSON.stringify(data, null, 2));
                } catch (e) {
                    text += `\n⚠️ Could not kick user: ${e.message}`;
                }
            }

            await sock.sendMessage(groupJid, { text: text, mentions: [mention] }, { quoted: m });

        } catch (e) {
            console.error("Warn.js Error:", e);
            await sock.sendMessage(m.key.remoteJid, { text: "❌ Something went wrong while warning user!" }, { quoted: m });
        }
    }
};
