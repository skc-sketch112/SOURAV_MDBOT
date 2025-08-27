const axios = require("axios");
const cheerio = require("cheerio");

// Helper function to add delay (mitigate rate limits)
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Helper function for FlamingText API (primary)
async function createFlamingText(styleId, text) {
    try {
        console.log(`[FlamingText] Requesting style: ${styleId}`);
        await sleep(1000); // 1-second delay
        const response = await axios.get(`https://www.flamingtext.com/netfu/tmp${styleId}/flamingtext.jpg?script=flaming-logo&text=${encodeURIComponent(text)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
            },
            timeout: 30000 // 30-second timeout
        });
        if (response.status !== 200) {
            throw new Error("FlamingText request failed.");
        }
        return response.request.res.responseUrl;
    } catch (error) {
        throw new Error(`FlamingText API Error: ${error.message}`);
    }
}

// Helper function for PhotoOxy API
async function createPhotoOxy(url, text) {
    try {
        console.log(`[PhotoOxy] Requesting URL: ${url}`);
        await sleep(1500); // 1.5-second delay
        const response = await axios.post(url, `text_1=${encodeURIComponent(text)}&login=OK`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
            },
            timeout: 30000
        });
        console.log(`[PhotoOxy] Response Status: ${response.status}`);
        const $ = cheerio.load(response.data);
        // Updated selectors for robustness
        const resultUrl = $('img.result-image').attr('src') ||
                          $('div.thumbnail a').attr('href') ||
                          $('img#generated-image').attr('src') ||
                          $('div.result img').attr('src') ||
                          $('img[src*="/images/"]').attr('src');
        if (!resultUrl) {
            console.log(`[PhotoOxy] HTML Response: ${response.data.substring(0, 500)}...`);
            throw new Error("Could not find image URL in PhotoOxy response.");
        }
        return resultUrl.startsWith('http') ? resultUrl : `https://photooxy.com${resultUrl}`;
    } catch (error) {
        throw new Error(`PhotoOxy API Error: ${error.message}`);
    }
}

// Helper function for TextPro API
async function createTextPro(url, text) {
    try {
        console.log(`[TextPro] Requesting URL: ${url}`);
        await sleep(1500); // 1.5-second delay
        const home = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
            },
            timeout: 30000
        });
        const $ = cheerio.load(home.data);
        const token = $('#token').val() || $('input[name="token"]').val();
        const build_server = $('#build_server').val() || $('input[name="build_server"]').val();
        const build_server_id = $('#build_server_id').val() || $('input[name="build_server_id"]').val();
        if (!token || !build_server || !build_server_id) {
            console.log(`[TextPro] HTML Response: ${home.data.substring(0, 500)}...`);
            throw new Error("Missing token or server details in TextPro response.");
        }
        const cookies = home.headers['set-cookie']?.join('; ') || '';

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
            },
            timeout: 30000
        });
        console.log(`[TextPro] POST Response Status: ${post.status}`);
        const result = post.data;
        if (!result || !result.image) {
            console.log(`[TextPro] POST Response: ${JSON.stringify(post.data, null, 2).substring(0, 500)}...`);
            throw new Error("Could not get image URL from TextPro response.");
        }
        return `https://textpro.me${result.image}`;
    } catch (error) {
        throw new Error(`TextPro API Error: ${error.message}`);
    }
}

module.exports = {
    name: "logo2",
    command: ["logo2", "logov2", "textlogo"],
    description: "Generate realistic text logos with a reliable multi-API system.",

    async execute(sock, m, args) {
        const jid = m.key.remoteJid;
        const [style, ...textArr] = args;
        const text = textArr.join(" ");

        // Validate input
        if (!style || !text) {
            const styleList = Object.keys(styles).map(s => `• ${s}`).join('\n');
            const helpText = `⚠️ command used wrongly please ensure you used a correct comnd।\n\n*ব্যবহারের নিয়ম:*\n.logo2 <style> <text>\n\n*উদাহরণ:*\n.logo2 neon Hello World\n\n*উপলব্ধ স্টাইলসমূহ:*\n${styleList}`;
            return await sock.sendMessage(jid, { text: helpText }, { quoted: m });
        }

        const styles = {
            // FlamingText Styles (primary, reliable)
            flaming: { api: 'flamingtext', styleId: '15/1' },
            glow: { api: 'flamingtext', styleId: '16/2' },
            neon: { api: 'flamingtext', styleId: '20/3' },
            // PhotoOxy Styles
            shadow: { api: 'photooxy', url: 'https://photooxy.com/logo-and-text-effects/shadow-text-effect-in-the-sky-394.html' },
            cup: { api: 'photooxy', url: 'https://photooxy.com/logo-and-text-effects/write-text-on-the-cup-392.html' },
            romantic: { api: 'photooxy', url: 'https://photooxy.com/logo-and-text-effects/romantic-messages-for-your-loved-one-391.html' },
            burnpaper: { api: 'photooxy', url: 'https://photooxy.com/logo-and-text-effects/write-text-on-burn-paper-388.html' },
            smoke: { api: 'photooxy', url: 'https://photooxy.com/other-design/create-an-easy-smoke-type-effect-390.html' },
            naruto: { api: 'photooxy', url: 'https://photooxy.com/manga-and-anime/make-naruto-banner-online-free-378.html' },
            lovemsg: { api: 'photooxy', url: 'https://photooxy.com/logo-and-text-effects/create-a-picture-of-love-message-377.html' },
            grass: { api: 'photooxy', url: 'https://photooxy.com/logo-and-text-effects/make-quotes-under-grass-376.html' },
            sweet: { api: 'photooxy', url: 'https://photooxy.com/logo-and-text-effects/sweet-candy-text-effect-358.html' },
            wood: { api: 'photooxy', url: 'https://photooxy.com/logo-and-text-effects/carved-wood-effect-online-171.html' },
            // TextPro Styles
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
            toxic: { api: 'textpro', url: 'https://textpro.me/toxic-text-effect-online-901.html' }
        };

        const selectedStyle = styles[style.toLowerCase()];
        if (!selectedStyle) {
            const styleList = Object.keys(styles).join(", ");
            return await sock.sendMessage(
                jid,
                { text: `❌ এই স্টাইলটি পাওয়া যায়নি!\n\n*উপলব্ধ স্টাইল:* ${styleList}` },
                { quoted: m }
            );
        }

        await sock.sendMessage(jid, { text: `⏳ আপনার *${style.toUpperCase()}* লোগো তৈরি করা হচ্ছে... অনুগ্রহ করে অপেক্ষা করুন।` }, { quoted: m });

        let imageUrl;
        let attemptCount = 0;
        const maxAttempts = 2;

        // Try APIs in order: FlamingText -> PhotoOxy -> TextPro
        while (attemptCount < maxAttempts) {
            try {
                if (selectedStyle.api === 'flamingtext') {
                    imageUrl = await createFlamingText(selectedStyle.styleId, text);
                } else if (selectedStyle.api === 'photooxy') {
                    imageUrl = await createPhotoOxy(selectedStyle.url, text);
                } else {
                    imageUrl = await createTextPro(selectedStyle.url, text);
                }

                // Validate image URL
                const response = await axios.head(imageUrl, { timeout: 10000 });
                if (response.status !== 200) {
                    throw new Error("Invalid image URL returned.");
                }

                // Send the generated image
                await sock.sendMessage(
                    jid,
                    {
                        image: { url: imageUrl },
                        caption: `✨ your*${style.toUpperCase()}* created sucessfully!\n\n📝 লেখা: *${text}*`
                    },
                    { quoted: m }
                );
                return; // Success, exit
            } catch (err) {
                console.error(`[Attempt ${attemptCount + 1}] Error:`, err.message);
                attemptCount++;
                if (attemptCount < maxAttempts) {
                    // Switch to fallback style
                    const fallbackStyle = styles[style.toLowerCase() === 'flaming' ? 'neon' : style.toLowerCase() === 'neon' ? 'shadow' : 'flaming'];
                    console.log(`[Fallback] Trying ${fallbackStyle.api} with style: ${style}`);
                    selectedStyle.api = fallbackStyle.api;
                    selectedStyle.url = fallbackStyle.url;
                    selectedStyle.styleId = fallbackStyle.styleId;
                    await sleep(2000); // Delay before retry
                } else {
                    await sock.sendMessage(
                        jid,
                        { text: `❌ Sorry , there is a problem to install logo।\n\n*কারণ:* ${err.message}\n\nঅনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন অথবা অন্য কোনো স্টাইল (যেমন: flaming, neon) ব্যবহার করুন।` },
                        { quoted: m }
                    );
                }
            }
        }
    }
};
