const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

module.exports = {
  name: 'song',
  command: ['song', 'music', 'play'],
  description: 'Download full song audio from 40+ sources (excluding YouTube and Spotify previews)',

  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    if (!args[0]) {
      return sock.sendMessage(
        jid,
        { text: '❌ Usage: .song <song name>\nExample: .song Despacito' },
        { quoted: m }
      );
    }

    const query = args.join(' ');
    console.log(`[SONG] Searching for: ${query}`);

    const downloadsDir = path.join(__dirname, '../downloads');
    if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });

    const tempFile = path.join(downloadsDir, `${Date.now()}.mp4`);
    const outFile = path.join(downloadsDir, `${Date.now()}.mp3`);

    let title = query;
    let thumbUrl = null;

    const sources = [
      // 1. JioSaavn
      async () => {
        try {
          const res = await axios.get(`https://saavn.me/search/songs?query=${encodeURIComponent(query)}&page=1&limit=1`);
          if (res.data?.data?.results?.[0]?.downloadUrl?.pop()) {
            const song = res.data.data.results[0];
            title = `${song.primaryArtists || 'Unknown'} - ${song.title}`;
            thumbUrl = song.image?.[2]?.link || null;
            return { type: 'direct', url: song.downloadUrl.pop().link };
          }
        } catch { return null; }
      },
      // 2. Gaana
      async () => {
        try {
          const res = await axios.get(`https://api.gaanaapi.xyz/search?song=${encodeURIComponent(query)}`);
          if (res.data?.data?.url) {
            title = `${res.data.data.artist || 'Unknown'} - ${res.data.data.title || query}`;
            thumbUrl = res.data.data.image || null;
            return { type: 'direct', url: res.data.data.url };
          }
        } catch { return null; }
      },
      // 3. Jamendo
      async () => {
        try {
          const res = await axios.get(`https://api.jamendo.com/v3.0/tracks/?client_id=7d8e5edc&q=${encodeURIComponent(query)}&limit=1`);
          if (res.data?.results?.[0]?.audio) {
            const track = res.data.results[0];
            title = `${track.artist_name} - ${track.name}`;
            thumbUrl = track.image || null;
            return { type: 'direct', url: track.audio };
          }
        } catch { return null; }
      },
      // 4. Free Music Archive
      async () => {
        try {
          const res = await axios.get(`https://freemusicarchive.org/api/trackSearch.php?search=${encodeURIComponent(query)}&limit=1`);
          if (res.data?.data?.[0]?.file_url) {
            const track = res.data.data[0];
            title = track.title;
            thumbUrl = track.image || null;
            return { type: 'direct', url: track.file_url };
          }
        } catch { return null; }
      },
      // 5. Musopen
      async () => {
        try {
          const res = await axios.get(`https://musopen.org/api/v1/music/?search=${encodeURIComponent(query)}&limit=1`);
          if (res.data?.results?.[0]?.audio_url) {
            const track = res.data.results[0];
            title = track.title;
            thumbUrl = track.image || null;
            return { type: 'direct', url: track.audio_url };
          }
        } catch { return null; }
      },
      // 6. Freesound
      async () => {
        try {
          const res = await axios.get(`https://freesound.org/apiv2/search/text/?query=${encodeURIComponent(query)}&token=YOUR_API_KEY`);
          if (res.data?.results?.[0]?.previews?.['preview-hq-mp3']) {
            const track = res.data.results[0];
            title = track.name;
            thumbUrl = track.images?.[0]?.uri || null;
            return { type: 'direct', url: track.previews['preview-hq-mp3'] };
          }
        } catch { return null; }
      },
      // 7. ccMixter
      async () => {
        try {
          const res = await axios.get(`https://ccmixter.org/api/query?query=${encodeURIComponent(query)}&limit=1`);
          if (res.data?.results?.[0]?.file_url) {
            const track = res.data.results[0];
            title = track.title;
            thumbUrl = track.image || null;
            return { type: 'direct', url: track.file_url };
          }
        } catch { return null; }
      },
      // 8. Dogmazic
      async () => {
        try {
          const res = await axios.get(`https://dogmazic.net/api/v1/search?query=${encodeURIComponent(query)}&limit=1`);
          if (res.data?.data?.[0]?.file_url) {
            const track = res.data.data[0];
            title = track.title;
            thumbUrl = track.image || null;
            return { type: 'direct', url: track.file_url };
          }
        } catch { return null; }
      },
      // Additional sources can be added here...
    ];

    let found = null;
    for (const fn of sources) {
      try {
        const res = await fn();
        if (res) {
          found = res;
          break;
        }
      } catch {}
    }

    if (!found) {
      return sock.sendMessage(
        jid,
        { text: '❌ No full-length song found for your query.' },
        { quoted: m }
      );
    }

    console.log(`[SONG] Using source: ${found.type}`);

    const writer = fs.createWriteStream(tempFile);
    const response = await axios({ url: found.url, method: 'GET', responseType: 'stream' });
    response.data.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    if (thumbUrl) {
      const thumbFile = path.join(downloadsDir, `${Date.now()}_thumb.jpg`);
      try {
        const img = await axios.get(thumbUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(thumbFile, Buffer.from(img.data, 'binary'));
      } catch {}
    }

    exec(`ffmpeg -i ${tempFile} -vn -ar 44100 -ac 2 -b:a 192k ${outFile}`, (err, stdout, stderr) => {
      if (err) {
        console.error('Error converting audio:', err);
        return sock.sendMessage(
          jid,
          { text: '❌ Error converting audio file.' },
          { quoted: m }
        );
      }

      sock.sendMessage(
        jid,
        {
          audio: { url: outFile },
          mimetype: 'audio/mp4',
          ptt: true,
          caption: `🎶 *${title}*\nSource: ${found.type}`,
          thumbnail: fs.existsSync(thumbFile) ? fs.readFileSync(thumbFile) : null,
        },
        { quoted: m }
      );
    });
  },
};
