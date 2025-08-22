// menu.js
const fs = require("fs");
const path = require("path");
const os = require("os");

module.exports = {
  command: "menu",
  info: "Shows the main bot menu",
  async execute(sock, m) {
    try {
      const { performance } = require("perf_hooks");

      // Bot Info
      const ownerName = "sourav_md";
      const botName = "SOURAV_MD";
      const version = "1.0.0";

      // Calculate speed
      const start = performance.now();
      const end = performance.now();
      const speed = (end - start).toFixed(2);

      // Uptime
      let uptimeSec = process.uptime();
      let uptime = new Date(uptimeSec * 1000).toISOString().substr(11, 8);

      // Date + Time
      const date = new Date().toLocaleDateString();
      const time = new Date().toLocaleTimeString();
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Auto Load Plugins
      const pluginDir = path.join(__dirname, ".");
      let categories = {};
      let totalPlugins = 0;

      fs.readdirSync(pluginDir).forEach(file => {
        if (file.endsWith(".js") && file !== "menu.js") {
          totalPlugins++;
          let category = "Other";
          if (file.includes("download")) category = "Download";
          else if (file.includes("group")) category = "Group";
          else if (file.includes("fun")) category = "Fun";
          else if (file.includes("owner")) category = "Owner";
          else if (file.includes("ai")) category = "AI";
          else if (file.includes("anime")) category = "Anime";
          else if (file.includes("convert")) category = "Convert";
          else if (file.includes("reaction")) category = "Reactions";
