const watermark = "🕊🦋⃝♥⃝ѕиєнα🍁♥⃝🕊";

module.exports = async function send(sock, jid, content, options = {}) {
  if (content.text) {
    content.text = `${watermark}\n\n${content.text}`;
  }
  return sock.sendMessage(jid, content, options);
};