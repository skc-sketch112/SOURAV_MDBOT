const axios = require("axios");

module.exports = {
  name: "book",
  command: ["book", "book2", "books"],
  description: "Search unlimited books from Google Books API",

  async execute(sock, m, args) {
    try {
      const sender = m.key.remoteJid;
      if (!args || args.length === 0) {
        return sock.sendMessage(sender, {
          text: "📚 Usage: *.book <title>*\nExample: *.book Harry Potter*"
        });
      }

      const query = args.join(" ");
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`;

      const res = await axios.get(url);

      if (!res.data.items || res.data.items.length === 0) {
        return sock.sendMessage(sender, { text: "❌ No books found for your search." });
      }

      let msg = "📖 *Book Search Results:*\n\n";
      for (let i = 0; i < res.data.items.length; i++) {
        const book = res.data.items[i].volumeInfo;
        const title = book.title || "Unknown Title";
        const authors = book.authors ? book.authors.join(", ") : "Unknown Author";
        const published = book.publishedDate || "Unknown Year";
        const desc = book.description ? book.description.substring(0, 200) + "..." : "No description available.";
        const link = book.previewLink || "No link available.";
        const thumbnail = book.imageLinks ? book.imageLinks.thumbnail : null;

        msg += `📌 *${title}*\n👨‍💻 Author(s): ${authors}\n📅 Published: ${published}\n📝 ${desc}\n🔗 [Preview Link](${link})\n\n`;

        if (thumbnail) {
          await sock.sendMessage(sender, {
            image: { url: thumbnail },
            caption: `📖 *${title}*\n👨‍💻 ${authors}\n📅 ${published}\n🔗 ${link}`
          });
        }
      }

      await sock.sendMessage(sender, { text: msg });

    } catch (err) {
      console.error("❌ Book fetch error:", err.message);
      return sock.sendMessage(m.key.remoteJid, {
        text: "⚠️ Error fetching books. Please try again later."
      });
    }
  }
};
