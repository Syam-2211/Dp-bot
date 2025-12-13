import send from "../utils/send.js";

export default {
  name: "status",
  execute: async (sock, msg) => {
    await send(sock, msg.key.remoteJid, { text: "📊 Bot is running fine." });
  }
};
