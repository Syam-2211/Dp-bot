export default {
  name: "unmute",
  execute: async (sock, msg, args) => {
    const jid = msg.key.remoteJid;
    await sock.sendMessage(jid, { text: "🔊 Chat unmuted by DP‑Bot™" });
  }
};
