const send = require("../utils/send");

module.exports = {
  name: "mute",
  description: "Mute the group",
  execute: async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    await sock.groupSettingUpdate(from, "announcement");
    await send(sock, from, { text: "🔇 Group muted (only admins can send messages)." });
  }
};
