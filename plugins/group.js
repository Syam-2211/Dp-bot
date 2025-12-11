const { withSignature } = require('../utils/signature')

module.exports = (sock, config, db) => {
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message) return
    const chatId = m.key.remoteJid
    const text = m.message.conversation || m.message.extendedTextMessage?.text || ''
    const cmd = text.trim().toLowerCase()
    const sender = m.key.participant || m.key.remoteJid

    if (cmd === `${config.prefix}groupinfo`) {
      const metadata = await sock.groupMetadata(chatId)
      await sock.sendMessage(chatId, { text: withSignature(`👥 Group: ${metadata.subject}\nMembers: ${metadata.participants.length}`, sender) })
    }

    if (cmd === `${config.prefix}tagall`) {
      const metadata = await sock.groupMetadata(chatId)
      const mentions = metadata.participants.map(p => p.id)
      await sock.sendMessage(chatId, { text: withSignature('📢 Tagging all members!', sender), mentions })
    }
  })
}