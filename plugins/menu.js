module.exports = {
    name: "menu",
    description: "Shows Sourav Bot Premium Menu",
    execute: async (sock, msg, sender) => {
        const menuText = `
╭─❏ *🤖 SOURAV_BOT 🤖* ❏─╮
│
│ 📌 𝙐𝙇𝙏𝙄𝙈𝘼𝙏𝙀 𝘽𝙊𝙏 𝙈𝙀𝙉𝙐
│─────────────────────
│ 👑 Owner: Sourav
│ 📚 Library: Baileys MD
│ 💻 Runtime: Node.js
│ 🚀 Platform: Heroku
│─────────────────────
│
│ 🎉 *FUN COMMANDS*
│ ───────────────
│ ✧ .joke → Random joke
│ ✧ .meme → Random meme
│ ✧ .quote → Inspirational quote
│
│ ⚡ *UTILITY COMMANDS*
│ ───────────────
│ ✧ .ping → pong ✅
│ ✧ .menu → show this menu 📖
│ ✧ .help → guide
│
│ 👑 *OWNER COMMANDS*
│ ───────────────
│ ✧ .restart → Restart bot
│ ✧ .block [user] → Block user
│ ✧ .unblock [user] → Unblock user
│
│ 🤖 *AI COMMANDS*
│ ───────────────
│ ✧ .ai [prompt] → Ask AI anything
│ ✧ .img [prompt] → Generate AI image
│
╰─────────────────────❏
        `;

        await sock.sendMessage(sender, {
            image: { url: "https://files.catbox.moe/h6ecol.jpg" }, // 🔥 Replace with your own banner
            caption: menuText
        });
    }
};
