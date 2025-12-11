const send = require("../utils/send");

module.exports = {
  name: "unban",
  description: "Unban a user",
  execute: async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];

    if (!mentioned.length) {
      return send(sock, from, { text: "✅ Mention a user to unban." });
    }

    const target = mentioned[0];
    await send(sock, from, { text: `✅ ${target} has been unbanned.` });
    // Remove from banlist logic here
  }
};
