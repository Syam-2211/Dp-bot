const send = require("../utils/send");
const os = require("os");

const startTime = Date.now();

module.exports = {
  name: "status",
  execute: async (sock, msg) => {
    const jid = msg.key.remoteJid;

    // Calculate uptime
    const uptimeMs = Date.now() - startTime;
    const uptimeSec = Math.floor(uptimeMs / 1000);
    const uptimeMin = Math.floor(uptimeSec / 60);
    const uptimeHr = Math.floor(uptimeMin / 60);

    const uptimeStr = `${uptimeHr}h ${uptimeMin % 60}m ${uptimeSec % 60}s`;

    // Count plugins
    const pluginCount = Object.keys(require.cache)
      .filter((f) => f.includes("/plugins/"))
      .length;

    // System info
    const memoryUsage = (os.totalmem() - os.freemem()) / (1024 * 1024);
    const cpuModel = os.cpus()[0].model;

    await send(sock, jid, {
      text: `📊 Bot Status\n\n⏱ Uptime: ${uptimeStr}\n🔌 Plugins Loaded: ${pluginCount}\n💻 CPU: ${cpuModel}\n🧠 Memory Used: ${memoryUsage.toFixed(2)} MB`
    });
  }
};