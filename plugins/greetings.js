module.exports = (sock, config, db) => {
  // Scheduled greetings
  setInterval(async () => {
    const hour = new Date().getHours()
    if (hour === 8) {
      await sock.sendMessage(config.defaultGroup, { text: "🌞 Good morning everyone!" })
    }
    if (hour === 22) {
      await sock.sendMessage(config.defaultGroup, { text: "🌙 Good night, sleep well!" })
    }
  }, 60 * 60 * 1000)

  // Keyword triggers
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message) return
    const text = m.message.conversation || m.message.extendedTextMessage?.text || ''
    const chatId = m.key.remoteJid

    if (/help/i.test(text)) {
      await sock.sendMessage(chatId, { text: "🤝 Type !menu to see all commands." })
    }
    if (/catalog/i.test(text)) {
      await sock.sendMessage(chatId, { text: "🛍️ Use !catalog to view our products." })
    }
  })
}
