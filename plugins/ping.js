const { withSignature } = require('../utils/signature')

module.exports = (sock, config, db) => {
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message) return
    const chatId = m.key.remoteJid
    const text = m.message.conversation || m.message.extendedTextMessage?.text || ''
    const cmd = text.trim().toLowerCase()
    const sender = m.key.participant || m.key.remoteJid

    if (cmd === `${config.prefix}ping`) {
      const start = Date.now()

      // Send initial "Pinging..." message
      const sentMsg = await sock.sendMessage(chatId, { text: withSignature('🏓 Pinging...', sender) })

      const latency = Date.now() - start
      const reply = `🏓 Pong!\n⚡ Response Time: *${latency}ms*`

      await sock.sendMessage(chatId, { text: withSignature(reply, sender) }, { quoted: sentMsg })
    }
  })
}
