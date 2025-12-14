export default {
  name: "alive",
  execute: async (sock, msg, args) => {
    await sock.sendMessage(msg.key.remoteJid, { text: "✅ Bot is alive with DP‑Bot™ watermark!" });
  }
};
