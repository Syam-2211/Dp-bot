module.exports = (sock, config, db) => {
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message) return
    const text = m.message.conversation || ''
    const chatId = m.key.remoteJid

    if (text === '!joke') {
      await sock.sendMessage(chatId, { text: "😂 Why don’t programmers like nature? Too many bugs!" })
    }
    if (text === '!quote') {
      await sock.sendMessage(chatId, { text: "💡 Success is not final, failure is not fatal: it is the courage to continue that counts." })
    }
  })
}
