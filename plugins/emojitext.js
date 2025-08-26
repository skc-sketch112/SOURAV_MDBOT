module.exports = {
    name: "emojitext",
    command: ["emojitext", "etext", "emo"],
    execute: async (sock, m, args) => {
        if(args.length < 2) {
            return await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Usage: `.emojitext 🙂 Sourav`" },
                { quoted: m }
            );
        }

        const emoji = args[0];
        const text = args.slice(1).join(" ").toUpperCase();

        const alphabet = {
            A: ["  E  "," E E ","EEEEE","E   E","E   E"],
            B: ["EEEE ","E   E","EEEE ","E   E","EEEE "],
            C: [" EEEE","E    ","E    ","E    "," EEEE"],
            D: ["EEEE ","E   E","E   E","E   E","EEEE "],
            E: ["EEEEE","E    ","EEE  ","E    ","EEEEE"],
            F: ["EEEEE","E    ","EEE  ","E    ","E    "],
            G: [" EEEE","E    ","E  EE","E   E"," EEEE"],
            H: ["E   E","E   E","EEEEE","E   E","E   E"],
            I: ["EEEEE","  E  ","  E  ","  E  ","EEEEE"],
            J: ["  JJJ","   J ","   J ","J  J "," JJ  "],
            K: ["E  E","E E ","EE  ","E E ","E  E"],
            L: ["E    ","E    ","E    ","E    ","EEEEE"],
            M: ["E   E","EE EE","E E E","E   E","E   E"],
            N: ["E   E","EE  E","E E E","E  EE","E   E"],
            O: [" EEE ","E   E","E   E","E   E"," EEE "],
            P: ["EEEE ","E   E","EEEE ","E    ","E    "],
            Q: [" EEE ","E   E","E   E","E  E "," EE E"],
            R: ["EEEE ","E   E","EEEE ","E  E ","E   E"],
            S: [" EEEE","E    "," EEE ","    E","EEEE "],
            T: ["EEEEE","  E  ","  E  ","  E  ","  E  "],
            U: ["E   E","E   E","E   E","E   E"," EEE "],
            V: ["E   E","E   E","E   E"," E E ","  E  "],
            W: ["E   E","E   E","E E E","EE EE","E   E"],
            X: ["E   E"," E E ","  E  "," E E ","E   E"],
            Y: ["E   E"," E E ","  E  ","  E  ","  E  "],
            Z: ["EEEEE","   E ","  E  "," E   ","EEEEE"],
            " ": ["     ","     ","     ","     ","     "]
        };

        let outputLines = ["", "", "", "", ""];
        for(let char of text){
            const letter = alphabet[char] || alphabet[" "];
            for(let i=0;i<5;i++){
                outputLines[i] += letter[i].replace(/E/g, emoji) + "  ";
            }
        }

        await sock.sendMessage(
            m.key.remoteJid,
            { text: outputLines.join("\n") },
            { quoted: m }
        );
    }
};
