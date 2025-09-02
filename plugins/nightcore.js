const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

// helper to exec shell commands with Promise
function execPromise(cmd, opts = {}) {
  return new Promise((resolve, reject) => {
    exec(cmd, opts, (err, stdout, stderr) => {
      if (err) return reject({ err, stdout, stderr });
      resolve({ stdout, stderr });
    });
  });
}

module.exports = {
  name: "nightcore",
  command: ["nightcore", "nc"],
  description: "Convert a song to Nightcore (speed+pitch). Usage: .nightcore <song or link> [speed]",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    if (!args.length) {
      return await sock.sendMessage(jid, { text: "⚠️ Usage: .nightcore <song name or link> [speed]\nExample: .nightcore sanam re 1.3" }, { quoted: m });
    }

    // parse last arg as optional speed if numeric
    let speed = 1.25; // default nightcore factor
    const lastArg = args[args.length - 1];
    if (!isNaN(parseFloat(lastArg)) && args.length > 1) {
      speed = Math.max(1.05, Math.min(2.0, parseFloat(lastArg))); // clamp between 1.05 and 2.0
      args.pop();
    }

    const query = args.join(" ");
    const tmpId = Date.now();
    const inputFile = path.join("/tmp", `nc_input_${tmpId}.%(ext)s`); // yt-dlp template
    const downloadedFile = path.join("/tmp", `nc_input_${tmpId}.mp3`); // expected final audio file name (yt-dlp will create .mp3 if forced)
    const outputFile = path.join("/tmp", `nc_output_${tmpId}.mp3`);

    // tell user we started (single loader message)
    let loaderMsg;
    try {
      loaderMsg = await sock.sendMessage(jid, { text: `🎧 Nightcore: Searching & transforming *${query}*...\nSpeed: ${speed}x\nPlease wait — this may take a moment.` }, { quoted: m });
    } catch (e) {
      // ignore send errors, continue
      console.error("Loader send error:", e?.message || e);
    }

    try {
      // Step 1: download audio with yt-dlp (use mp3 output directly)
      // Use ytsearch if user passed a plain query; if it's a URL start with http, pass directly.
      const source = query.startsWith("http") ? query : `ytsearch1:${query}`;

      // Use yt-dlp to extract audio as mp3 directly to downloadedFile
      // We use -x --audio-format mp3 and output the single file location
      const ytdlpCmd = `yt-dlp -x --audio-format mp3 -o "${downloadedFile}" "${source}" --no-warnings --no-playlist --quiet`;
      await execPromise(ytdlpCmd, { maxBuffer: 1024 * 1024 * 50 }); // increase buffer

      // Confirm file exists
      if (!fs.existsSync(downloadedFile)) {
        throw new Error("Download failed or yt-dlp produced no file.");
      }

      const stat = fs.statSync(downloadedFile);
      if (stat.size < 50 * 1024) {
        // small file likely invalid
        throw new Error("Downloaded file too small / invalid audio.");
      }

      // Step 2: transform to nightcore using ffmpeg
      // We'll shift sample rate to change pitch (asetrate) and then resample + adjust tempo (atempo).
      // Filter: asetrate=44100*speed, aresample=44100, atempo=1/speed_correction? 
      // Simpler and stable approach: change sample rate to raise pitch, then use atempo to adjust playback speed.
      // We'll compute pitchFactor ~ speed, and atempo to keep within allowed atempo (0.5-2.0, chain if needed).
      const pitchFactor = speed; // e.g., 1.25
      // atempo must be in [0.5,2.0]. We'll use atempo = 1 (no extra) because changing sample rate already speeds playback.
      // For a more "nightcore" feel we want both higher pitch and slightly faster tempo. We'll use atempo=1.0 here and rely on asetrate.
      // However many prefer both pitch + tempo; we will chain atempo if final playback needs adjust. We'll use a gentle atempo of 1.0 (safe).
      // Final filter:
      //  - asetrate=44100*{pitchFactor} : raises pitch
      //  - aresample=44100 : resample back to 44100
      //  - atempo={tempoFactor} : adjust tempo if desired (we'll use min(2.0, speed))
      let tempoFactor = speed; // use same factor; ffmpeg atempo supports up to 2.0, so this is safe for our clamped range
      // chain atempo filters if tempoFactor>2.0 (we clamped to 2.0 so not needed)
      const ffFilter = `asetrate=44100*${pitchFactor},aresample=44100,atempo=${tempoFactor}`;

      const ffCmd = `ffmpeg -y -i "${downloadedFile}" -vn -af "${ffFilter}" -b:a 192k "${outputFile}" -hide_banner -loglevel error`;
      await execPromise(ffCmd, { maxBuffer: 1024 * 1024 * 100 });

      // Validate output
      if (!fs.existsSync(outputFile)) {
        throw new Error("ffmpeg failed to produce output.");
      }
      const outStat = fs.statSync(outputFile);
      if (outStat.size < 30 * 1024) throw new Error("Output audio too small / invalid.");

      // Optional: WhatsApp size limit handling (rough): if > 60MB, try re-encoding to smaller bitrate
      const MAX_ALLOWED = 60 * 1024 * 1024; // 60MB
      if (outStat.size > MAX_ALLOWED) {
        const reducedFile = path.join("/tmp", `nc_output_${tmpId}_re.mp3`);
        // re-encode to lower bitrate
        await execPromise(`ffmpeg -y -i "${outputFile}" -vn -b:a 128k "${reducedFile}" -hide_banner -loglevel error`);
        fs.unlinkSync(outputFile);
        fs.renameSync(reducedFile, outputFile);
      }

      // Step 3: Send audio (use file URL so Baileys handles streaming)
      await sock.sendMessage(jid, {
        audio: { url: outputFile },
        mimetype: "audio/mpeg",
        ptt: false
      }, { quoted: m });

      // cleanup
      try { fs.unlinkSync(downloadedFile); } catch (e) {}
      try { fs.unlinkSync(outputFile); } catch (e) {}

      // Optionally edit loader message to say done (if supported). We'll just send a short confirmation.
      try {
        await sock.sendMessage(jid, { text: `✅ Nightcore delivered — speed ${speed}x. Enjoy!` }, { quoted: m });
      } catch {}

    } catch (err) {
      console.error("Nightcore error:", err);
      // try to give friendly message
      let msg = (err && err.err && err.err.message) ? err.err.message : (err.message || String(err));
      if (msg.length > 300) msg = msg.slice(0, 300) + "...";
      await sock.sendMessage(jid, { text: `❌ Nightcore failed: ${msg}` }, { quoted: m });
      // cleanup any leftovers
      [downloadedFile, outputFile].forEach(f => { try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch (e) {} });
    }
  }
};
