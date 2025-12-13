import send from "../utils/send.js";

export default {
  name: "unban",
  execute: async (sock, msg, args) => {
    const user = args[0];
    await send(sock, msg.key.remoteJid, { text: `✅ User ${user} unbanned.` });
  }
};
