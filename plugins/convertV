const fs = require('fs')
const path = require('path')
const { withSignature } = require('../utils/signature')

module.exports = (sock, config, db) => {
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message) return
    const chatId = m.key.remoteJid
    const body = m.message.conversation || m.message.extendedTextMessage?.text || ''
    const cmd = body.trim().toLowerCase()

    // !mp3 when replying to a voice note (PTT)
    if (cmd === `${config.prefix}mp3`) {
      const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage
      if (!quoted || !quoted.audioMessage) {
        await sock.sendMessage(chatId, { text: withSignature('⚠️ Please reply to a voice note with !mp3', m.key.participant || m.key.remoteJid) })
        return
      }

      try {
        const buffer = await sock.downloadMediaMessage({ message: quoted })
        const filePath = path.join(__dirname, '../downloads/voice.mp3')
        fs.writeFileSync(filePath, buffer)

        await sock.sendMessage(chatId, {
          audio: { url: filePath },
          mimetype: 'audio/mpeg',
          ptt: false
        })
      } catch (err) {
        await sock.sendMessage(chatId, { text: withSignature('❌ Failed to convert voice note.', m.key.participant || m.key.remoteJid) })
      }
    }
  })
}
