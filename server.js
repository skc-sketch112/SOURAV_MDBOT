// server.js → Keeps your Render app alive
const express = require("express");
const app = express();

// Root route
app.get("/", (req, res) => {
  res.send("✅ WhatsApp Bot is running...");
});

// Ping route (UptimeRobot will hit this)
app.get("/ping", (req, res) => {
  res.json({ status: "alive", time: new Date().toISOString() });
});

// Start server on Render-assigned port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌍 Keep-alive server running on port ${PORT}`);
});
