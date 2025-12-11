const fs = require('fs')
const path = require('path')
const { withSignature } = require('../utils/signature')
const { getTimeSlot, isWeekend } = require('../utils/time')

module.exports = (sock, config, db) => {
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message) return
    const chatId = m.key.remoteJid
    const text = m.message.conversation || m.message.extendedTextMessage?.text || ''

    if (text.trim().toLowerCase() === `${config.prefix}alive`) {
      const slot = getTimeSlot()
      const weekend = isWeekend()
      let audioFile = path.join(__dirname, `../media/alive-${slot}.mp3`)
      let aliveMessage = `✅ ${config.botName} is *Alive* and running smoothly!

🤖 Version: 0.0.0.0.0
🛠️ Powered by: Node.js + Baileys
📂 Features: Business • Fun • Admin • Automation • Stickers •
🔗 Repo: ${config.repoUrl}`

      if (weekend) {
        audioFile = path.join(__dirname, '../media/alive-weekend.mp3')
        aliveMessage += `\n🎉 Weekend Vibes!`
      } else {
        const greetings = {
          morning: '🌞 Good Morning!',
          afternoon: '💼 Good Afternoon!',
          evening: '🌙 Good Evening!',
          night: '🌌 Good Night!'
        }
        aliveMessage += `\n${greetings[slot]}`
      }

      await sock.sendMessage(chatId, { text: withSignature(aliveMessage, m.key.participant || m.key.remoteJid) })

      if (fs.existsSync(audioFile)) {
        await sock.sendMessage(chatId, {
          audio: { url: audioFile },
          mimetype: 'audio/mp4',
          ptt: true
        })
      }
    }
  })
}
