module.exports = {
    name: "heart",
    command: ["heart", "hearts", "brokenheart", "sparkheart", "love"],
    description: "Send different heart emojis with animation",

    execute: async (sock, m, args) => {
        const cmd = m.message.conversation.split(" ")[0].slice(1).toLowerCase();

        let text = "";
        switch (cmd) {
            case "heart":
                text = "❤️";
                break;

            case "hearts":
                text = "❤️💙💚💛💜🖤🤍🤎💖💝💓💗";
                break;

            case "brokenheart":
                text = "💔💔💔";
                break;

            case "sparkheart":
                text = "💖💖💖";
                break;

            case "love":
                // Animated beating hearts 💓
                const hearts = ["❤️", "💖", "💘", "💝", "💗", "💓", "💕"];
                for (let i = 0; i < hearts.length; i++) {
                    await sock.sendMessage(
                        m.key.remoteJid,
                        { text: hearts[i] },
                        { quoted: m }
                    );
                    await new Promise(res => setTimeout(res, 500)); // delay 0.5s between messages
                }
                return;

            default:
                text = "❤️ Use: .heart | .hearts | .brokenheart | .sparkheart | .love";
        }

        await sock.sendMessage(m.key.remoteJid, { text }, { quoted: m });
    }
};
