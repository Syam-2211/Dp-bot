const { withSignature } = require('../utils/signature')

module.exports = (sock, config, db) => {
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message) return
    const chatId = m.key.remoteJid
    const text = m.message.conversation || m.message.extendedTextMessage?.text || ''

    if (text.trim().toLowerCase() === `${config.prefix}info`) {
      const msg = `ℹ️ *${config.botName} Information*

🤖 Bot Name: ${config.botName}
🛠️ Built With: Node.js + Baileys
📂 Features: Business • Social • Admin • Automation
🔊 Voice: Dynamic alive voices (time/day-based)
🎨 Stickers: Photo/video to sticker with metadata
🔗 Repo: ${config.repoUrl}`

      await sock.sendMessage(chatId, { text: withSignature(msg, m.key.participant || m.key.remoteJid) })
    }
  })
}
