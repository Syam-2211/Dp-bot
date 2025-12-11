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

    if (cmd === `${config.prefix}sticker`) {
      const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage
      if (!quoted || (!quoted.imageMessage && !quoted.videoMessage)) {
        await sock.sendMessage(chatId, { text: withSignature('⚠️ Please reply to a photo or short video with !sticker', m.key.participant || m.key.remoteJid) })
        return
      }

      try {
        const buffer = await sock.downloadMediaMessage({ message: quoted })
        const filePath = path.join(__dirname, '../downloads/sticker.webp')
        fs.writeFileSync(filePath, buffer)

        await sock.sendMessage(chatId, {
          sticker: { url: filePath },
          // Sticker metadata (visible in sticker info)
          packname: "🕊🦋⃝♥⃝ѕиєнα🍁♥⃝🦋⃝🕊",
          author: "🤍⃞𝄟ꪶ𝐒͢ʏ᪳ᴀ͓ᴍ͎ ͢𝐒ᴇ͓ꪳʀ͎𖦻⃞🍓"
        })
      } catch (err) {
        await sock.sendMessage(chatId, { text: withSignature('❌ Failed to convert media to sticker.', m.key.participant || m.key.remoteJid) })
      }
    }
  })
}
