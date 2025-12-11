const send = require("../utils/send");

module.exports = {
  name: "unmute",
  description: "Unmute the group",
  execute: async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    await sock.groupSettingUpdate(from, "not_announcement");
    await send(sock, from, { text: "🔊 Group unmuted (everyone can send messages)." });
  }
};
