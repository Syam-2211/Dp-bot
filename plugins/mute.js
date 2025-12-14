export default {
  name: "mute",
  execute: async (sock, msg, args) => {
    const jid = msg.key.remoteJid;
    await sock.sendMessage(jid, { text: "🔇 Chat muted by DP‑Bot™" });
  }
};
