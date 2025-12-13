export default {
  name: "logger",
  execute: async (sock, msg, command) => {
    console.log(`📝 Command used: ${command} by ${msg.key.remoteJid}`);
  }
};
