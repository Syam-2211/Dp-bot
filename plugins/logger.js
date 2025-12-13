module.exports = {
  name: "logger",
  execute: async (sock, msg, command) => {
    const sender = msg.key.participant || msg.key.remoteJid;
    console.log(`✅ Executed: ${command} by ${sender}`);
  }
};
