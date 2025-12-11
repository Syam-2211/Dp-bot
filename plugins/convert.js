const { withSignature } = require('../utils/signature')

module.exports = (sock, config, db) => {
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message) return
    const chatId = m.key.remoteJid
    const text = m.message.conversation || m.message.extendedTextMessage?.text || ''
    const cmd = text.trim().toLowerCase()
    const sender = m.key.participant || m.key.remoteJid

    if (cmd === `${config.prefix}toaudio`) {
      const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage
      if (!quoted || !quoted.videoMessage) {
        await sock.sendMessage(chatId, { text: withSignature('⚠️ Reply to a video with !toaudio', sender) })
        return
      }
      const buffer = await sock.downloadMediaMessage({ message: quoted })
      await sock.sendMessage(chatId, { audio: buffer, mimetype: 'audio/mpeg' })
    }

    if (cmd === `${config.prefix}reverse`) {
      await sock.sendMessage(chatId, { text: withSignature('🔄 Reverse audio effect not yet implemented.', sender) })
    }

    if (cmd === `${config.prefix}bass`) {
      await sock.sendMessage(chatId, { text: withSignature('🎵 Bass boost effect not yet implemented.', sender) })
    }
  })
}