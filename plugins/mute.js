import send from "../utils/send.js";

export default {
  name: "mute",
  execute: async (sock, msg) => {
    await send(sock, msg.key.remoteJid, { text: "🔇 Group muted." });
  }
};
