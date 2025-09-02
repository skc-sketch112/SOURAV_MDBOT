// interstellarPic.js
const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
  name: 'interstellarPic',
  alias: ['interstellarwallpaper', 'ip'],
  desc: 'Fetches a random high-resolution wallpaper from the movie Interstellar.',
  category: 'fun',
  usage: '.interstellar',
  execute: async (sock, m, args) => {
    try {
      // Fetch a list of high-resolution wallpapers from a trusted source
      const { data } = await axios.get('https://wallpapers.com/interstellar');
      const $ = cheerio.load(data);

      // Extract image URLs from the page
      const imageUrls = [];
      $('img').each((index, element) => {
        const src = $(element).attr('src');
        if (src && src.includes('interstellar')) {
          imageUrls.push(src);
        }
      });

      // Ensure there are images available
      if (imageUrls.length === 0) {
        return await sock.sendMessage(
          m.key.remoteJid,
          { text: '⚠️ No Interstellar wallpapers found at the moment. Please try again later.' },
          { quoted: m }
        );
      }

      // Select a random image URL
      const randomImageUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)];

      // Send the selected image as a message
      await sock.sendMessage(
        m.key.remoteJid,
        { image: { url: randomImageUrl }, caption: '🌌 Interstellar Wallpaper' },
        { quoted: m }
      );
    } catch (error) {
      console.error('Error fetching Interstellar wallpaper:', error);
      await sock.sendMessage(
        m.key.remoteJid,
        { text: '⚠️ Failed to fetch a wallpaper. Please try again later.' },
        { quoted: m }
      );
    }
  }
};
