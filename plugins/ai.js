const { withSignature } = require('../utils/signature')

module.exports = (sock, config, db) => {
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message) return
    const chatId = m.key.remoteJid
    const text = m.message.conversation || m.message.extendedTextMessage?.text || ''
    const cmd = text.trim().toLowerCase()
    const sender = m.key.participant || m.key.remoteJid

    if (cmd.startsWith(`${config.prefix}ask `)) {
      const question = text.slice(`${config.prefix}ask `.length)
      await sock.sendMessage(chatId, { text: withSignature(`🤖 AI Answer (placeholder): ${question}`, sender) })
    }

    if (cmd.startsWith(`${config.prefix}translate `)) {
      const phrase = text.slice(`${config.prefix}translate `.length)
      await sock.sendMessage(chatId, { text: withSignature(`🌐 Translation (placeholder): ${phrase}`, sender) })
    }
  })
}