import send from "../utils/send.js";

export default {
  name: "ban",
  execute: async (sock, msg, args) => {
    const user = args[0];
    await send(sock, msg.key.remoteJid, { text: `🚫 User ${user} banned.` });
  }
};
