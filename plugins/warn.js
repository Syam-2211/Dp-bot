export default {
  name: "warn",
  execute: async (sock, msg, args) => {
    const jid = msg.key.remoteJid;
    await sock.sendMessage(jid, { text: "⚠️ Warning issued by DP‑Bot™" });
  }
};
