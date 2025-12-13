import send from "../utils/send.js";

export default {
  name: "alive",
  execute: async (sock, msg) => {
    await send(sock, msg.key.remoteJid, { text: "✅ Bot is alive!" });
  }
};
