const { withSignature } = require('../utils/signature')

module.exports = (sock, config, db) => {
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message) return
    const chatId = m.key.remoteJid
    const text = m.message.conversation || m.message.extendedTextMessage?.text || ''
    const cmd = text.trim().toLowerCase()
    const sender = m.key.participant || m.key.remoteJid

    // 🚫 Antilink
    if (db.get('antilink')?.includes(chatId)) {
      if (text.includes('http://') || text.includes('https://')) {
        await sock.sendMessage(chatId, { text: withSignature('⚠️ Links are not allowed here.', sender) })
        await sock.sendMessage(chatId, { delete: m.key })
      }
    }

    // 🔒 Enable/disable antilink
    if (cmd === `${config.prefix}antilink on`) {
      db.set('antilink', [...(db.get('antilink') || []), chatId])
      await sock.sendMessage(chatId, { text: withSignature('✅ Antilink enabled for this group.', sender) })
    }
    if (cmd === `${config.prefix}antilink off`) {
      db.set('antilink', (db.get('antilink') || []).filter(id => id !== chatId))
      await sock.sendMessage(chatId, { text: withSignature('❌ Antilink disabled for this group.', sender) })
    }

    // 🔇 Mute / Unmute
    if (cmd === `${config.prefix}mute`) {
      await sock.groupSettingUpdate(chatId, 'announcement')
      await sock.sendMessage(chatId, { text: withSignature('🔇 Group muted. Only admins can send messages.', sender) })
    }
    if (cmd === `${config.prefix}unmute`) {
      await sock.groupSettingUpdate(chatId, 'not_announcement')
      await sock.sendMessage(chatId, { text: withSignature('🔊 Group unmuted. Everyone can send messages.', sender) })
    }

    // 🚷 Ban / Unban
    if (cmd.startsWith(`${config.prefix}ban `)) {
      const number = text.slice(`${config.prefix}ban `.length).replace(/[^0-9]/g, '')
      const jid = `${number}@s.whatsapp.net`
      db.set('banned', [...(db.get('banned') || []), jid])
      await sock.sendMessage(chatId, { text: withSignature(`🚷 User banned: ${number}`, sender) })
    }
    if (cmd.startsWith(`${config.prefix}unban `)) {
      const number = text.slice(`${config.prefix}unban `.length).replace(/[^0-9]/g, '')
      const jid = `${number}@s.whatsapp.net`
      db.set('banned', (db.get('banned') || []).filter(id => id !== jid))
      await sock.sendMessage(chatId, { text: withSignature(`✅ User unbanned: ${number}`, sender) })
    }
    if (cmd === `${config.prefix}banlist`) {
      const list = (db.get('banned') || []).map(j => j.replace('@s.whatsapp.net','')).join(', ')
      await sock.sendMessage(chatId, { text: withSignature(`🚷 Banned users:\n${list || 'None'}`, sender) })
    }

    // ⚠️ Warn system
    if (cmd.startsWith(`${config.prefix}warn `)) {
      const number = text.slice(`${config.prefix}warn `.length).replace(/[^0-9]/g, '')
      const jid = `${number}@s.whatsapp.net`
      const warns = db.get('warns') || {}
      warns[jid] = (warns[jid] || 0) + 1
      db.set('warns', warns)

      await sock.sendMessage(chatId, { text: withSignature(`⚠️ User ${number} warned. Total warns: ${warns[jid]}`, sender) })

      // Auto-ban after 3 warns
      if (warns[jid] >= 3) {
        const banned = db.get('banned') || []
        if (!banned.includes(jid)) {
          banned.push(jid)
          db.set('banned', banned)
          await sock.sendMessage(chatId, { text: withSignature(`🚷 User ${number} auto-banned after 3 warns.`, sender) })
        }
      }
    }

    if (cmd.startsWith(`${config.prefix}resetwarn `)) {
      const number = text.slice(`${config.prefix}resetwarn `.length).replace(/[^0-9]/g, '')
      const jid = `${number}@s.whatsapp.net`
      const warns = db.get('warns') || {}
      warns[jid] = 0
      db.set('warns', warns)
      await sock.sendMessage(chatId, { text: withSignature(`✅ Warns reset for ${number}`, sender) })
    }

    if (cmd === `${config.prefix}warnlist`) {
      const warns = db.get('warns') || {}
      const list = Object.entries(warns).map(([jid, count]) => `${jid.replace('@s.whatsapp.net','')}: ${count}`).join('\n')
      await sock.sendMessage(chatId, { text: withSignature(`⚠️ Warn list:\n${list || 'None'}`, sender) })
    }
  })
}