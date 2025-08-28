const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

module.exports = {
  name: 'song',
  command: ['song', 'music', 'play'],
  description: 'Download song audio from 15+ sources (no full-length checks)',

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
    console.log(`[SONG] Searching: ${query}`);

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
          const song = res.data?.data?.results?.[0];
          if (song?.downloadUrl?.length) {
            title = `${song.primaryArtists || 'Unknown'} - ${song.title}`;
            thumbUrl = song.image?.[2]?.link || null;
            return { url: song.downloadUrl.pop().link };
          }
        } catch { return null; }
      },
      // 2. Gaana
      async () => {
        try {
          const res = await axios.get(`https://api.gaanaapi.xyz/search?song=${encodeURIComponent(query)}`);
          const track = res.data?.data;
          if (track?.url) {
            title = `${track.artist || 'Unknown'} - ${track.title || query}`;
            thumbUrl = track.image || null;
            return { url: track.url };
          }
        } catch { return null; }
      },
      // 3. Jamendo
      async () => {
        try {
          const res = await axios.get(`https://api.jamendo.com/v3.0/tracks/?client_id=7d8e5edc&q=${encodeURIComponent(query)}&limit=1`);
          const track = res.data?.results?.[0];
          if (track?.audio) {
            title = `${track.artist_name} - ${track.name}`;
            thumbUrl = track.image || null;
            return { url: track.audio };
          }
        } catch { return null; }
      },
      // 4. Free Music Archive
      async () => {
        try {
          const res = await axios.get(`https://freemusicarchive.org/api/trackSearch.php?search=${encodeURIComponent(query)}&limit=1`);
          const track = res.data?.data?.[0];
          if (track?.file_url) {
            title = track.title;
            thumbUrl = track.image || null;
            return { url: track.file_url };
          }
        } catch { return null; }
      },
      // 5. Musopen
      async () => {
        try {
          const res = await axios.get(`https://musopen.org/api/v1/music/?search=${encodeURIComponent(query)}&limit=1`);
          const track = res.data?.results?.[0];
          if (track?.audio_url) {
            title = track.title;
            thumbUrl = track.image || null;
            return { url: track.audio_url };
          }
        } catch { return null; }
      },
      // 6. Freesound (requires YOUR_API_KEY)
      async () => {
        try {
          const res = await axios.get(`https://freesound.org/apiv2/search/text/?query=${encodeURIComponent(query)}&token=YOUR_API_KEY`);
          const track = res.data?.results?.[0];
          if (track?.previews?.['preview-hq-mp3']) {
            title = track.name;
            thumbUrl = track.images?.[0]?.uri || null;
            return { url: track.previews['preview-hq-mp3'] };
          }
        } catch { return null; }
      },
      // 7. ccMixter
      async () => {
        try {
          const res = await axios.get(`https://ccmixter.org/api/query?query=${encodeURIComponent(query)}&limit=1`);
          const track = res.data?.results?.[0];
          if (track?.file_url) {
            title = track.title;
            thumbUrl = track.image || null;
            return { url: track.file_url };
          }
        } catch { return null; }
      },
      // 8. Dogmazic
      async () => {
        try {
          const res = await axios.get(`https://dogmazic.net/api/v1/search?query=${encodeURIComponent(query)}&limit=1`);
          const track = res.data?.data?.[0];
          if (track?.file_url) {
            title = track.title;
            thumbUrl = track.image || null;
            return { url: track.file_url };
          }
        } catch { return null; }
      },
      // 9. TheAudioDB
      async () => {
        try {
          const res = await axios.get(`https://www.theaudiodb.com/api/v1/json/2/searchtrack.php?s=${encodeURIComponent(query)}`);
          const track = res.data?.track?.[0];
          if (track?.strTrackFile) {
            title = `${track.strArtist} - ${track.strTrack}`;
            thumbUrl = track.strTrackThumb || null;
            return { url: track.strTrackFile };
          }
        } catch { return null; }
      },
      // 10. FreePD
      async () => {
        try {
          const res = await axios.get(`https://freepd.com/api/search?q=${encodeURIComponent(query)}&limit=1`);
          const track = res.data?.data?.[0];
          if (track?.url) {
            title = track.title;
            thumbUrl = track.image || null;
            return { url: track.url };
          }
        } catch { return null; }
      },
      // 11. SoundCloud (requires YOUR_CLIENT_ID)
      async () => {
        try {
          const res = await axios.get(`https://api.soundcloud.com/tracks?client_id=YOUR_CLIENT_ID&q=${encodeURIComponent(query)}&limit=1`);
          const track = res.data?.[0];
          if (track?.stream_url) {
            title = track.title;
            thumbUrl = track.artwork_url || null;
            return { url: track.stream_url };
          }
        } catch { return null; }
      },
      // 12. Audiomack
      async () => {
        try {
          const res = await axios.get(`https://api.audiomack.com/search?q=${encodeURIComponent(query)}&limit=1`);
          const track = res.data?.data?.[0];
          if (track?.url) {
            title = track.title;
            thumbUrl = track.artwork_url || null;
            return { url: track.url };
          }
        } catch { return null; }
      },
      // 13. Bandcamp
      async () => {
        try {
          const res = await axios.get(`https://bandcamp.com/api/search?q=${encodeURIComponent(query)}&limit=1`);
          const track = res.data?.[0];
          if (track?.url) {
            title = track.title;
            thumbUrl = track.artwork_url || null;
            return { url: track.url };
          }
        } catch { return null; }
      },
      // 14. Napster (requires YOUR_API_KEY)
      async () => {
        try {
          const res = await axios.get(`https://api.napster.com/v2.2/search/track?apikey=YOUR_API_KEY&query=${encodeURIComponent(query)}&limit=1`);
          const track = res.data?.tracks?.data?.[0];
          if (track?.previewURL) {
            title = `${track.artistName} - ${track.name}`;
            thumbUrl = track.albumUrl || null;
            return { url: track.previewURL };
          }
        } catch { return null; }
      },
      // 15. Mixcloud
      async () => {
        try {
          const res = await axios.get(`https://api.mixcloud.com/search?q=${encodeURIComponent(query)}&limit=1`);
          const track = res.data?.data?.[0];
          if (track?.url) {
            title = track.name;
            thumbUrl = track.pictures?.medium || null;
            return { url: track.url };
          }
        } catch { return null; }
      },
    ];

    let found = null;
    for (const fn of sources) {
      try {
        const res = await fn();
        if (res?.url) {
          found = res;
          break;
        }
      } catch {}
    }

    if (!found) {
      console.log('[SONG] No URL found. Stopping silently.');
      return;
    }

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

    exec(`ffmpeg -i ${tempFile} -vn -ar 44100 -ac 2 -b:a 192k ${outFile}`, (err) => {
      if (err) return console.error('Error converting audio:', err);

      sock.sendMessage(
        jid,
        {
          audio: { url: outFile },
          mimetype: 'audio/mp4',
          ptt: true,
          caption: `🎶 *${title}*`,
          thumbnail: thumbUrl ? fs.readFileSync(path.join(downloadsDir, `${Date.now()}_thumb.jpg`)) : null,
        },
        { quoted: m }
      );
    });
  },
};
