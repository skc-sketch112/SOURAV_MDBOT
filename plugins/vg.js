const fetch = require("node-fetch");

module.exports = {
  name: "vg",
  alias: ["vg",  "vidgen"],
  desc: "Generate an accurate short video from a prompt",
  category: "fun",
  react: "🔁",
  usage: ".vg <prompt>",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    const query = args.join(" ");
    if (!query) {
      return sock.sendMessage(jid, {
        text: "⚠️ Usage: .vg <prompt>\nExample: .vg cow dancing"
      }, { quoted: m });
    }

    try {
      // 20+ APIs focused on AI / stock video generation
      const apis = [
        `https://api.ryzendesu.vip/api/text2video?prompt=${encodeURIComponent(query)}`,
        `https://api.nyx.vodka/gen/video?prompt=${encodeURIComponent(query)}`,
        `https://videogen.alyx.xyz/api?prompt=${encodeURIComponent(query)}`,
        `https://apis.itslit.uk/video?query=${encodeURIComponent(query)}`,
        `https://api.edenai.run/v2/video/generation?text=${encodeURIComponent(query)}`,
        `https://api.deepai.org/api/text2video?text=${encodeURIComponent(query)}`,
        `https://api.clipdrop.co/video?prompt=${encodeURIComponent(query)}`,
        `https://api.picsart.io/tools/video-gen?prompt=${encodeURIComponent(query)}`,
        `https://api.runwayml.com/v1/gen/video?prompt=${encodeURIComponent(query)}`,
        `https://api.dreamfusion.ai/video?prompt=${encodeURIComponent(query)}`,
        `https://api.pika.art/gen/video?prompt=${encodeURIComponent(query)}`,
        `https://api.kaiber.ai/generate/video?text=${encodeURIComponent(query)}`,
        `https://api.luma.ai/text2video?prompt=${encodeURIComponent(query)}`,
        `https://api.fal.ai/video?prompt=${encodeURIComponent(query)}`,
        `https://api.d-id.com/text-to-video?prompt=${encodeURIComponent(query)}`,
        `https://api.craiyon.com/video?prompt=${encodeURIComponent(query)}`,
        `https://api.levit.ai/video?prompt=${encodeURIComponent(query)}`,
        `https://api.stablevid.com/generate?prompt=${encodeURIComponent(query)}`,
        `https://api.genmo.ai/v1/video?prompt=${encodeURIComponent(query)}`,
        `https://api.zebracat.ai/video?prompt=${encodeURIComponent(query)}`
      ];

      let videoUrl = null;

      for (const api of apis) {
        try {
          const res = await fetch(api, { method: "GET" });
          if (!res.ok) continue;

          const data = await res.json().catch(() => null);
          if (!data) continue;

          // Extract video link from possible API responses
          if (data.url && data.url.includes("http")) videoUrl = data.url;
          else if (data.video && data.video.includes("http")) videoUrl = data.video;
          else if (data.result && data.result.includes("http")) videoUrl = data.result;
          else if (data.link && data.link.includes("http")) videoUrl = data.link;
          else if (data.output && data.output.includes("http")) videoUrl = data.output;

          if (videoUrl) break; // stop once we get a real video
        } catch (err) {
          continue;
        }
      }

      if (!videoUrl) {
        return sock.sendMessage(jid, {
          text: "❌ Could not generate the exact video right now. Try again!"
        }, { quoted: m });
      }

      await sock.sendMessage(jid, {
        video: { url: videoUrl },
        caption: `🎥 Generated video for: *${query}*`
      }, { quoted: m });

    } catch (err) {
      console.error("[VG ERROR]:", err);
      await sock.sendMessage(jid, {
        text: "⚠️ Failed to generate video. Try again later!"
      }, { quoted: m });
    }
  }
};
