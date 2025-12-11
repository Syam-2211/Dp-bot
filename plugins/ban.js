const send = require("../utils/send");

module.exports = {
  name: "ban",
  description: "Ban a user manually",
  execute: async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];

    if (!mentioned.length) {
      return send(sock, from, { text: "🚫 Mention a user to ban." });
    }

    const target = mentioned[0];
    await send(sock, from, { text: `🚫 ${target} has been banned.` });
    // Add ban logic here (kick from group, etc.)
  }
};
