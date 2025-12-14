export default {
  name: "ban",
  execute: async (sock, msg, args) => {
    const jid = msg.key.remoteJid;
    await sock.sendMessage(jid, { text: "⛔ User banned by DP‑Bot™" });
  }
};
