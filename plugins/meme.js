const fetch = require("node-fetch");

module.exports = {
    name: "meme",
    command: ["meme", "randommeme"],
    description: "Send random memes from Reddit (unlimited)",

    async execute(sock, msg, args) {
        try {
            const subReddits = [
                "memes",
                "dankmemes",
                "wholesomememes",
                "me_irl",
                "funny"
            ];

            const randomSub = subReddits[Math.floor(Math.random() * subReddits.length)];
            const url = `https://www.reddit.com/r/${randomSub}/random/.json`;

            let response = await fetch(url);
            let json = await response.json();

            let post = json[0].data.children[0].data;
            let memeUrl = post.url;
            let title = post.title;

            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: memeUrl },
                caption: `🤣 *${title}*\n\n🌍 from r/${randomSub}`
            }, { quoted: msg });

        } catch (e) {
            console.log("Meme error:", e);
            await sock.sendMessage(msg.key.remoteJid, {
                text: "⚠️ Couldn’t fetch meme, try again!"
            }, { quoted: msg });
        }
    }
};
