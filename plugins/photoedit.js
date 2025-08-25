const fs = require("fs-extra");
const Jimp = require("jimp");

module.exports = {
  name: "photoedit",
  command: ["photoedit"],
  description: "Apply 30+ effects to photos",

  start: async (sock, msg, args) => {
    try {
      if (!msg.message.imageMessage && !msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
        return sock.sendMessage(msg.key.remoteJid, {
          text: "❌ Reply to an image with `.photoedit <effect>`",
        });
      }

      const effect = (args[0] || "").toLowerCase();
      if (!effect) {
        return sock.sendMessage(msg.key.remoteJid, {
          text: "⚡ Available Effects: blur, invert, sepia, greyscale, brightness, contrast, posterize, mirror, flip, rotate, pixelate, normalize, fade, dither, shadow, emboss, sharpen, glow, threshold, opacity, lighten, darken, scale, crop, gaussian, swirl, solarize, hue, saturation, vibrance, noise, fisheye, sketch"
        });
      }

      // Download image buffer
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      let buffer;
      if (msg.message.imageMessage) {
        buffer = await sock.downloadMediaMessage(msg);
      } else if (quoted?.imageMessage) {
        buffer = await sock.downloadMediaMessage({ message: quoted });
      }

      const image = await Jimp.read(buffer);

      // === Effects ===
      switch (effect) {
        case "blur": image.blur(5); break;
        case "invert": image.invert(); break;
        case "sepia": image.sepia(); break;
        case "greyscale": image.greyscale(); break;
        case "brightness": image.brightness(0.3); break;
        case "contrast": image.contrast(0.5); break;
        case "posterize": image.posterize(5); break;
        case "mirror": image.mirror(true, false); break;
        case "flip": image.mirror(false, true); break;
        case "rotate": image.rotate(90); break;
        case "pixelate": image.pixelate(10); break;
        case "normalize": image.normalize(); break;
        case "fade": image.fade(0.3); break;
        case "dither": image.dither565(); break;
        case "shadow": image.contrast(0.3).brightness(-0.2); break;
        case "emboss": image.convolute([[2,0,0],[0,-1,0],[0,0,-1]]); break;
        case "sharpen": image.convolute([[0,-1,0],[-1,5,-1],[0,-1,0]]); break;
        case "glow": image.brightness(0.5).contrast(-0.2); break;
        case "threshold": image.posterize(2); break;
        case "opacity": image.opacity(0.5); break;
        case "lighten": image.brightness(0.5); break;
        case "darken": image.brightness(-0.5); break;
        case "scale": image.scale(0.5); break;
        case "crop": image.crop(0, 0, image.bitmap.width / 2, image.bitmap.height / 2); break;
        case "gaussian": image.gaussian(3); break;
        case "solarize": image.invert().brightness(0.2); break;
        case "hue": image.color([{ apply: "hue", params: [90] }]); break;
        case "saturation": image.color([{ apply: "saturate", params: [50] }]); break;
        case "vibrance": image.color([{ apply: "mix", params: ["#ff0000", 30] }]); break;
        case "noise": image.noise(50); break;
        case "fisheye": image.scale(1.2).crop(20,20,image.bitmap.width-40,image.bitmap.height-40); break;
        case "sketch": image.greyscale().posterize(3).contrast(1); break;
        default:
          return sock.sendMessage(msg.key.remoteJid, { text: `❌ Effect not found: ${effect}` });
      }

      // Save file
      const out = "./temp_edit.jpg";
      await image.writeAsync(out);

      // Send edited photo
      await sock.sendMessage(msg.key.remoteJid, {
        image: { url: out },
        caption: `✅ Effect *${effect}* applied successfully by SOURAV_MD!`,
      });

      await fs.unlink(out);

    } catch (e) {
      console.error("PhotoEdit Error:", e);
      await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Error editing photo!" });
    }
  },
};
