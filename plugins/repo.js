const { withSignature } = require('../utils/signature')

module.exports = (sock, config, db) => {
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message) return
    const chatId = m.key.remoteJid
    const text = m.message.conversation || m.message.extendedTextMessage?.text || ''

    const cmd = text.trim().toLowerCase()
    if (cmd === `${config.prefix}repo` || cmd === `${config.prefix}sc` || cmd === `${config.prefix}script`) {
      const msg = `📦 Repository

🔗 Repo: ${config.repoUrl}
🧰 Tech: Node.js • Baileys
📜 License: MIT (or your choice)`

      await sock.sendMessage(chatId, { text: withSignature(msg, m.key.participant || m.key.remoteJid) })
    }
  })
}
