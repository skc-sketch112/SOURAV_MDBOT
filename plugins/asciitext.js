// asciiManual.js

// ASCII letters mapping (predefined, classic banner style)
const asciiMap = {
  "A": [
    "    _    ",
    "   / \\   ",
    "  / _ \\  ",
    " / ___ \\ ",
    "/_/   \\_\\"
  ],
  "B": [
    " ____  ",
    "| __ ) ",
    "|  _ \\ ",
    "| |_) |",
    "|____/ "
  ],
  "C": [
    "  ____ ",
    " / ___|",
    "| |    ",
    "| |___ ",
    " \\____|"
  ],
  "D": [
    " ____  ",
    "|  _ \\ ",
    "| | | |",
    "| |_| |",
    "|____/ "
  ],
  "E": [
    " _____ ",
    "| ____|",
    "|  _|  ",
    "| |___ ",
    "|_____|"
  ],
  "F": [
    " _____ ",
    "|  ___|",
    "| |_   ",
    "|  _|  ",
    "|_|    "
  ],
  "G": [
    "  ____ ",
    " / ___|",
    "| |  _ ",
    "| |_| |",
    " \\____|"
  ],
  "H": [
    " _   _ ",
    "| | | |",
    "| |_| |",
    "|  _  |",
    "|_| |_|"
  ],
  "I": [
    " ___ ",
    "|_ _|",
    " | | ",
    " | | ",
    "|___|"
  ],
  "J": [
    "     _ ",
    "    | |",
    "    | |",
    " _  | |",
    "| |_| |",
    " \\___/ "
  ],
  "K": [
    " _  __",
    "| |/ /",
    "| ' / ",
    "| . \\ ",
    "|_|\\_\\"
  ],
  "L": [
    " _     ",
    "| |    ",
    "| |    ",
    "| |___ ",
    "|_____|"
  ],
  "M": [
    " __  __ ",
    "|  \\/  |",
    "| |\\/| |",
    "| |  | |",
    "|_|  |_|"
  ],
  "N": [
    " _   _ ",
    "| \\ | |",
    "|  \\| |",
    "| |\\  |",
    "|_| \\_|"
  ],
  "O": [
    "  ___  ",
    " / _ \\ ",
    "| | | |",
    "| |_| |",
    " \\___/ "
  ],
  "P": [
    " ____  ",
    "|  _ \\ ",
    "| |_) |",
    "|  __/ ",
    "|_|    "
  ],
  "Q": [
    "  ___  ",
    " / _ \\ ",
    "| | | |",
    "| |_| |",
    " \\__\\_\\"
  ],
  "R": [
    " ____  ",
    "|  _ \\ ",
    "| |_) |",
    "|  _ < ",
    "|_| \\_\\"
  ],
  "S": [
    " ____ ",
    "/ ___|",
    "\\___ \\",
    " ___) |",
    "|____/ "
  ],
  "T": [
    " _____ ",
    "|_   _|",
    "  | |  ",
    "  | |  ",
    "  |_|  "
  ],
  "U": [
    " _   _ ",
    "| | | |",
    "| | | |",
    "| |_| |",
    " \\___/ "
  ],
  "V": [
    "__     __",
    "\\ \\   / /",
    " \\ \\ / / ",
    "  \\ V /  ",
    "   \\_/   "
  ],
  "W": [
    "__        __",
    "\\ \\      / /",
    " \\ \\ /\\ / / ",
    "  \\ V  V /  ",
    "   \\_/\\_/   "
  ],
  "X": [
    "__  __",
    "\\ \\/ /",
    " >  < ",
    "/_/\\_\\"
  ],
  "Y": [
    "__   __",
    "\\ \\ / /",
    " \\ V / ",
    "  | |  ",
    "  |_|  "
  ],
  "Z": [
    " _____",
    "|__  /",
    "  / / ",
    " / /_ ",
    "/____|"
  ],
  " ": [
    "  ",
    "  ",
    "  ",
    "  ",
    "  "
  ],
  "0": [
    "  ___  ",
    " / _ \\ ",
    "| | | |",
    "| |_| |",
    " \\___/ "
  ],
  "1": [
    " __ ",
    "/_ |",
    " | |",
    " | |",
    " |_|"
  ],
  "2": [
    " ___  ",
    "|__ \\ ",
    "   ) |",
    "  / / ",
    " |____|"
  ],
  "3": [
    " ____  ",
    "|___ \\ ",
    "  __) |",
    " |__ < ",
    " ___) |",
    "|____/ "
  ],
  "4": [
    " _  _   ",
    "| || |  ",
    "| || |_ ",
    "|__   _|",
    "   |_|  "
  ],
  "5": [
    " _____ ",
    "| ____|",
    "| |__  ",
    "|___ \\ ",
    " ___) |",
    "|____/ "
  ],
  "6": [
    "  __   ",
    " / /   ",
    "/ /_   ",
    "| '_ \\ ",
    "| (_) |",
    " \\___/ "
  ],
  "7": [
    " ______",
    "|____  |",
    "    / / ",
    "   / /  ",
    "  /_/   "
  ],
  "8": [
    "  ___  ",
    " ( _ ) ",
    " / _ \\ ",
    "| (_) |",
    " \\___/ "
  ],
  "9": [
    "  ___  ",
    " / _ \\ ",
    "| (_) |",
    " \\__, |",
    "   /_/ "
  ],
  "!": [
    " _ ",
    "| |",
    "| |",
    "|_|",
    "   "
  ],
  "?": [
    " ___  ",
    "|__ \\ ",
    "   ) |",
    "  / / ",
    " |_|  "
  ]
};

// Combine letters into full text
function getAsciiText(input) {
  input = input.toUpperCase();
  const lines = ["", "", "", "", ""];
  for (const char of input) {
    const asciiChar = asciiMap[char] || asciiMap[" "];
    for (let i = 0; i < lines.length; i++) {
      lines[i] += asciiChar[i] + "  "; // add space between letters
    }
  }
  return lines.join("\n");
}

// Auto-scale long words
function scaleAsciiText(input) {
  const MAX_LENGTH = 10; // WhatsApp-friendly width
  if (input.length <= MAX_LENGTH) return getAsciiText(input);
  // Split long words
  let result = "";
  for (let i = 0; i < input.length; i += MAX_LENGTH) {
    const chunk = input.slice(i, i + MAX_LENGTH);
    result += getAsciiText(chunk) + "\n";
  }
  return result;
}

module.exports = {
  name: "asciibanner",
  alias: ["at", "banner"],
  desc: "Generate classic ASCII banner letters (manual, WhatsApp-friendly)",
  category: "fun",
  usage: ".asciibanner <text>",
  execute: async (sock, m, args) => {
    try {
      if (!args.length) {
        return await sock.sendMessage(
          m.key.remoteJid,
          { text: "❌ Usage: .asciibanner <text>\nExample: .asciibanner SOURAV" },
          { quoted: m }
        );
      }

      const inputText = args.join("");
      const asciiArt = scaleAsciiText(inputText);

      await sock.sendMessage(
        m.key.remoteJid,
        { text: "```\n" + asciiArt + "\n```" },
        { quoted: m }
      );

    } catch (err) {
      console.error("❌ Error in asciibanner:", err);
      await sock.sendMessage(
        m.key.remoteJid,
        { text: "⚠️ Failed to generate ASCII banner." },
        { quoted: m }
      );
    }
  }
};
