const send = require("../utils/send");

module.exports = {
  name: "alive",
  description: "Check if bot is alive",
  execute: async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    await send(sock, from, { text: "✅ Bot is alive and running!" });
  }
};
