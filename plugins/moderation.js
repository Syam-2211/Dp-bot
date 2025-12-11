module.exports = (sock, config, db) => {
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message) return
    const text = m.message.conversation || ''
    const chatId = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid

    // Anti-link
    if (/https?:\/\//i.test(text) && !config.allowLinks) {
      await sock.sendMessage(chatId, { text: "🚫 Links are not allowed here!" })
      db.addBan(sender)
    }

    // Welcome messages (when someone joins)
    sock.ev.on('group-participants.update', async (update) => {
      if (update.action === 'add') {
        for (let participant of update.participants) {
          await sock.sendMessage(update.id, { text: `👋 Welcome @${participant.split('@')[0]}!` })
        }
      }
    })
  })
}
