const { withSignature } = require('../utils/signature')

module.exports = (sock, config, db) => {
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message) return
    const chatId = m.key.remoteJid
    const text = m.message.conversation || m.message.extendedTextMessage?.text || ''
    const cmd = text.trim().toLowerCase()
    const sender = m.key.participant || m.key.remoteJid

    if (cmd.startsWith(`${config.prefix}play `)) {
      const query = text.slice(`${config.prefix}play `.length)
      await sock.sendMessage(chatId, { text: withSignature(`🎵 Downloading audio for: ${query} (placeholder)`, sender) })
    }

    if (cmd.startsWith(`${config.prefix}ytvideo `)) {
      const query = text.slice(`${config.prefix}ytvideo `.length)
      await sock.sendMessage(chatId, { text: withSignature(`📹 Downloading YouTube video: ${query} (placeholder)`, sender) })
    }
  })
}