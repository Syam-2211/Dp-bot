const { withSignature } = require('../utils/signature')

function isSudo(config, jid) {
  return config.sudo.includes(jid)
}

module.exports = (sock, config, db) => {
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message) return
    const chatId = m.key.remoteJid
    const text = m.message.conversation || m.message.extendedTextMessage?.text || ''
    const cmd = text.trim().toLowerCase()
    const sender = m.key.participant || m.key.remoteJid

    if (cmd.startsWith(`${config.prefix}broadcast `)) {
      if (!isSudo(config, sender)) {
        await sock.sendMessage(chatId, { text: withSignature('⛔ Admin only command.', sender) })
        return
      }
      const message = text.slice(`${config.prefix}broadcast `.length)
      await sock.sendMessage(chatId, { text: withSignature(`📢 Broadcast:\n${message}`, sender) })
    }

    if (cmd === `${config.prefix}stats`) {
      const data = db.get('stats') || { commands: 0 }
      await sock.sendMessage(chatId, { text: withSignature(`📈 Stats\nTotal commands processed: ${data.commands}`, sender) })
    }
  })
}
