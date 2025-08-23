// =============== C-REACT (Love Only Reactions) ===============
module.exports = {
    name: "creact",
    command: ["creact"],
    description: "Custom react with only love emojis ❤️",
    
    async execute(sock, m, args) {
        const loveEmojis = [
            "❤️", "💖", "💞", "💕", "💘", 
            "💝", "💓", "💗", "💙", "💚", 
            "💜", "🖤", "🤍", "🤎"
        ];

        // Pick a random love emoji
        const randomLove = loveEmojis[Math.floor(Math.random() * loveEmojis.length)];

        try {
            await sock.sendMessage(m.key.remoteJid, {
                react: { text: randomLove, key: m.key }
            });
            console.log(`💘 C-React used: ${randomLove}`);
        } catch (err) {
            console.error("❌ Error in creact:", err.message);
        }
    }
};
