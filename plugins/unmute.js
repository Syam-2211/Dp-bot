import send from "../utils/send.js";

export default {
  name: "unmute",
  execute: async (sock, msg) => {
    await send(sock, msg.key.remoteJid, { text: "🔊 Group unmuted." });
  }
};
