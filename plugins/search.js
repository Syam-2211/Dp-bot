const { withSignature } = require('../utils/signature')
const fetch = require('node-fetch')

module.exports = (sock, config, db) => {
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message) return
    const chatId = m.key.remoteJid
    const text = m.message.conversation || m.message.extendedTextMessage?.text || ''
    const cmd = text.trim().toLowerCase()
    const sender = m.key.participant || m.key.remoteJid

    if (cmd.startsWith(`${config.prefix}imdb `)) {
      const query = text.slice(`${config.prefix}imdb `.length)
      const res = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(query)}&apikey=demo`)
      const data = await res.json()
      if (data.Title) {
        await sock.sendMessage(chatId, { text: withSignature(`🎬 ${data.Title} (${data.Year})\n⭐ ${data.imdbRating}`, sender) })
      }
    }

    if (cmd.startsWith(`${config.prefix}wikipedia `)) {
      const query = text.slice(`${config.prefix}wikipedia `.length)
      await sock.sendMessage(chatId, { text: withSignature(`📖 Wikipedia search for: ${query}\n(Not yet implemented fully)`, sender) })
    }
  })
}