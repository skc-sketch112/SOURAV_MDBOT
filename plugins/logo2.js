const axios = require("axios");
const cheerio = require("cheerio");

// Helper function to add delay (mitigate rate limits)
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Helper function for PhotoOxy API
async function createPhotoOxy(url, text) {
    try {
        console.log(`[PhotoOxy] Requesting URL: ${url}`);
        await sleep(1000); // 1-second delay to avoid rate limits
        const response = await axios.post(url, `text_1=${encodeURIComponent(text)}&login=OK`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
            }
        });
        console.log(`[PhotoOxy] Response Status: ${response.status}`);
        const $ = cheerio.load(response.data);
        // Updated selector to match current PhotoOxy structure
        const resultUrl = $('img.result-image').attr('src') || $('div.thumbnail a').attr('href');
        if (!resultUrl) throw new Error("Could not find image URL in PhotoOxy response.");
        return resultUrl.startsWith('http') ? resultUrl : `https://photooxy.com${resultUrl}`;
    } catch (error) {
        throw new Error(`PhotoOxy API Error: ${error.message}`);
    }
}

// Helper function for TextPro API
async function createTextPro(url, text) {
    try {
        console.log(`[TextPro] Requesting URL: ${url}`);
        await sleep(1000); // 1-second delay
        // Step 1: Get token and cookies
        const home = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
            }
        });
        const $ = cheerio.load(home.data);
        const token = $('#token').val();
        const build_server = $('#build_server').val();
        const build_server_id = $('#build_server_id').val();
        if (!token || !build_server || !build_server_id) {
            throw new Error("Missing token or server details in TextPro response.");
        }
        const cookies = home.headers['set-cookie']?.join('; ') || '';

        // Step 2: Post text to generate image
        const post = await axios.post('https://textpro.me/effect/create-image', new URLSearchParams({
            'text[]': text,
            'submit': 'Go',
            token,
            build_server,
            build_server_id,
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
                'Cookie': cookies
            }
        });
        console.log(`[TextPro] POST Response:`, post.data);
        const result = post.data;
        if (!result || !result.image) throw new Error("Could not get image URL from TextPro response.");
        return `https://textpro.me${result.image}`;
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

        // List of supported styles with updated URLs (verified as of August 2025)
        const styles = {
            // PhotoOxy Styles
            shadow: { api: 'photooxy', url: 'https://photooxy.com/logo-and-text-effects/shadow-text-effect-in-the-sky-394.html' },
            cup: { api: 'photooxy', url: 'https://photooxy.com/logo-and-text-effects/write-text-on-the-cup-392.html' },
            romantic: { api: 'photooxy', url: 'https://photooxy.com/logo-and-text-effects/romantic-messages-for-your-loved-one-391.html' },
            burnpaper: { api: 'photooxy', url: 'https://photooxy.com/logo-and-text-effects/write-text-on-burn-paper-388.html' },
            smoke: { api: 'photooxy', url: 'https://photooxy.com/other-design/create-an-easy-smoke-type-effect-390.html' },
            naruto: { api: 'photooxy', url: 'https://photooxy.com/manga-and-anime/make-naruto-banner-online-free-378.html' },
            lovemsg: { api: 'photooxy', url: 'https://photooxy.com/logo-and-text-effects/create-a-picture-of-love-message-377.html' },
            grass: { api: 'photooxy', url: 'https://photooxy.com/logo-and-text-effects/make-quotes-under-grass-376.html' },
            glow: { api: 'photooxy', url: 'https://photooxy.com/logo-and-text-effects/glow-neon-light-text-effect-online-882.html' },
            sweet: { api: 'photooxy', url: 'https://photooxy.com/logo-and-text-effects/sweet-candy-text-effect-358.html' },
            wood: { api: 'photooxy', url: 'https://photooxy.com/logo-and-text-effects/carved-wood-effect-online-171.html' },
            // TextPro Styles
            neon: { api: 'textpro', url: 'https://textpro.me/create-3d-neon-light-text-effect-online-1028.html' },
            blackpink: { api: 'textpro', url: 'https://textpro.me/create-blackpink-logo-style-online-1001.html' },
            joker: { api: 'textpro', url: 'https://textpro.me/create-logo-joker-online-934.html' },
            metallic: { api: 'textpro', url: 'https://textpro.me/create-a-metallic-text-effect-free-online-1041.html' },
            thor: { api: 'textpro', url: 'https://textpro.me/create-thor-logo-style-text-effect-online-1064.html' },
            harrypotter: { api: 'textpro', url: 'https://textpro.me/create-harry-potter-text-effect-online-1025.html' },
            pornhub: { api: 'textpro', url: 'https://textpro.me/pornhub-style-logo-online-generator-free-977.html' },
            avengers: { api: 'textpro', url: 'https://textpro.me/create-3d-avengers-logo-online-974.html' },
            marvel: { api: 'textpro', url: 'https://textpro.me/create-logo-style-marvel-studios-ver-metal-972.html' },
            glitch: { api: 'textpro', url: 'https://textpro.me/create-glitch-text-effect-style-tik-tok-983.html' },
            water: { api: 'textpro', url: 'https://textpro.me/3d-underwater-text-effect-generator-online-1013.html' },
            ice: { api: 'textpro', url: 'https://textpro.me/ice-cold-text-effect-862.html' },
            stone: { api: 'textpro', url: 'https://textpro.me/3d-stone-cracked-cool-text-effect-1029.html' },
            space: { api: 'textpro', url: 'https://textpro.me/create-space-text-effects-online-free-1042.html' },
            magma: { api: 'textpro', url: 'https://textpro.me/create-a-magma-hot-text-effect-online-1030.html' },
            sand: { api: 'textpro', url: 'https://textpro.me/write-in-sand-summer-beach-free-online-991.html' },
            cloud: { api: 'textpro', url: 'https://textpro.me/create-a-cloud-text-effect-in-the-sky-online-997.html' },
            demon: { api: 'textpro', url: 'https://textpro.me/create-green-horror-style-text-effect-online-1036.html' },
            transformer: { api: 'textpro', url: 'https://textpro.me/create-a-transformer-text-effect-online-1035.html' },
            berry: { api: 'textpro', url: 'https://textpro.me/create-berry-text-effect-online-free-1033.html' },
            thunder: { api: 'textpro', url: 'https://textpro.me/online-thunder-text-effect-generator-1031.html' },
            carbon: { api: 'textpro', url: 'https://textpro.me/carbon-text-effect-833.html' },
            blood: { api: 'textpro', url: 'https://textpro.me/horror-blood-text-effect-online-883.html' },
            toxic: { api: 'textpro', url: 'https://textpro.me/toxic-text-effect-online-901.html' },
        };

        // Validate input
        if (!style || !text) {
            const styleList = Object.keys(styles).map(s => `• ${s}`).join('\n');
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

        // Inform user that processing has started
        await sock.sendMessage(jid, { text: `⏳ আপনার *${style.toUpperCase()}* লোগো তৈরি করা হচ্ছে... অনুগ্রহ করে অপেক্ষা করুন।` }, { quoted: m });

        let imageUrl;
        try {
            // Primary API attempt
            if (selectedStyle.api === 'photooxy') {
                imageUrl = await createPhotoOxy(selectedStyle.url, text);
            } else {
                imageUrl = await createTextPro(selectedStyle.url, text);
            }

            // Send the generated image
            await sock.sendMessage(
                jid,
                {
                    image: { url: imageUrl },
                    caption: `✨ আপনার *${style.toUpperCase()}* স্টাইলের লোগো তৈরি!\n\n📝 লেখা: *${text}*`
                },
                { quoted: m }
            );
        } catch (err) {
            console.error("[Main Error]:", err.message);
            // Fallback to the other API
            try {
                const fallbackStyle = styles[style.toLowerCase() === 'shadow' ? 'neon' : 'shadow'];
                if (fallbackStyle.api === 'photooxy') {
                    imageUrl = await createPhotoOxy(fallbackStyle.url, text);
                } else {
                    imageUrl = await createTextPro(fallbackStyle.url, text);
                }
                await sock.sendMessage(
                    jid,
                    {
                        image: { url: imageUrl },
                        caption: `✨ [Fallback] আপনার *${style.toUpperCase()}* স্টাইলের লোগো তৈরি!\n\n📝 লেখা: *${text}*`
                    },
                    { quoted: m }
                );
            } catch (fallbackErr) {
                console.error("[Fallback Error]:", fallbackErr.message);
                await sock.sendMessage(
                    jid,
                    { text: `❌ দুঃখিত, লোগো তৈরি করতে একটি সমস্যা হয়েছে।\n\n*কারণ:* ${fallbackErr.message}\n\nঅনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন অথবা অন্য কোনো স্টাইল ব্যবহার করুন।` },
                    { quoted: m }
                );
            }
        }
    }
};
