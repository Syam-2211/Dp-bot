const fetch = require("node-fetch")
const { withSignature } = require('../utils/signature')

module.exports = (sock, config, db) => {
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message) return
    const chatId = m.key.remoteJid
    const text = m.message.conversation || m.message.extendedTextMessage?.text || ''
    const sender = m.key.participant || m.key.remoteJid

    // Check if message mentions any SUDO number
    const mentioned = config.sudo.find(num => text.includes(num.replace('@s.whatsapp.net','')))
    if (mentioned) {
      // Rotate audio + thumbnail
      const songs = [
        "https://cdn.ironman.my.id/q/yjryp.mp4",
        "https://cdn.ironman.my.id/q/ywecS.mp4",
        "https://cdn.ironman.my.id/q/zRSwS.mp4",
        "https://cdn.ironman.my.id/q/FpJYh.mp4",
        "https://cdn.ironman.my.id/q/wVHal.mp4"
      ]
      const imgs = [
        "https://files.catbox.moe/mev5cq.jpeg"
      ]
      const songMsg = songs[Math.floor(Math.random() * songs.length)]
      const imgMsg = imgs[Math.floor(Math.random() * imgs.length)]

      try {
        const audioBuffer = await (await fetch(songMsg)).buffer()
        await sock.sendMessage(chatId, {
          audio: audioBuffer,
          mimetype: 'audio/mp4',
          ptt: false,
          contextInfo: {
            externalAdReply: {
              title: config.botName, // 🕊🦋⃝♥⃝ѕиєнα🍁♥⃝🦋⃝🕊
              body: "Hy bro!",
              sourceUrl: config.repoUrl,
              mediaUrl: "https://www.instagram.com/",
              mediaType: 1,
              showAdAttribution: true,
              renderLargerThumbnail: false,
              thumbnailUrl: imgMsg
            }
          }
        }, { quoted: m })
      } catch (err) {
        await sock.sendMessage(chatId, { text: withSignature("❌ Failed to fetch mention audio.", sender) })
      }
    }
  })
}
