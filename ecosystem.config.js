module.exports = {
  apps: [
    {
      name: "SOURAV_MD",
      script: "index.js",
      watch: true,
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
}
