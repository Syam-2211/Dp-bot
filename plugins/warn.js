const send = require("../utils/send");
const warns = {};

module.exports = {
  name: "warn",
  description: "Warn a user, auto-ban after 3 warnings",
  execute: async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];

    if (!mentioned.length) {
      return send(sock, from, { text: "⚠️ Mention a user to warn." });
    }

    const target = mentioned[0];
    warns[target] = (warns[target] || 0) + 1;

    if (warns[target] >= 3) {
      await send(sock, from, { text: `🚫 ${target} has been banned (3 warnings).` });
      // Add ban logic here (kick from group, etc.)
    } else {
      await send(sock, from, { text: `⚠️ ${target} warned (${warns[target]}/3).` });
    }
  }
};
