const { withSignature } = require('../utils/signature')

module.exports = (sock, config, db) => {
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message) return
    const chatId = m.key.remoteJid
    const text = m.message.conversation || m.message.extendedTextMessage?.text || ''
    const cmd = text.trim().toLowerCase()
    const sender = m.key.participant || m.key.remoteJid

    if (cmd === `${config.prefix}menu`) {
      const menu = `📜 ${config.botName} MENU
──────────────
💼 Business Tools
• ${config.prefix}catalog • ${config.prefix}status <id> • ${config.prefix}remind <time> <text>
🎉 Fun & Social
• ${config.prefix}joke • ${config.prefix}quote • ${config.prefix}quiz • ${config.prefix}rps • ${config.prefix}dice • ${config.prefix}meme
🧠 Productivity
• ${config.prefix}weather • ${config.prefix}news • ${config.prefix}define • ${config.prefix}translate • ${config.prefix}note • ${config.prefix}task • ${config.prefix}convert
👥 Group Management
• Welcome • Anti-spam • Anti-link • ${config.prefix}poll "Q" opt1 opt2
📦 Repo & Script
• ${config.prefix}repo • ${config.prefix}sc • ${config.prefix}script`

      await sock.sendMessage(chatId, { text: withSignature(menu, sender) })
    }
  })
}
