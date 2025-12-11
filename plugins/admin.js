const { withSignature } = require('../utils/signature')

function isSudo(config, jid) {
  return config.sudo.includes(jid)
}

module.exports = (sock, config, db) => {
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message) return
    const chatId = m.key.remoteJid
    const text = m.message.conversation || m.message.extendedTextMessage?.text || ''
    const cmd = text.trim().toLowerCase()
    const sender = m.key.participant || m.key.remoteJid

    // Add sudo
    if (cmd.startsWith(`${config.prefix}add sudo `)) {
      if (!isSudo(config, sender)) {
        await sock.sendMessage(chatId, { text: withSignature('⛔ Admin only command.', sender) })
        return
      }
      const number = text.slice(`${config.prefix}add sudo `.length).replace(/[^0-9]/g, '')
      if (!number) {
        await sock.sendMessage(chatId, { text: withSignature('⚠️ Provide a valid number.', sender) })
        return
      }
      const jid = `${number}@s.whatsapp.net`
      if (!config.sudo.includes(jid)) {
        config.sudo.push(jid)
        db.set('sudo', config.sudo) // persist
        await sock.sendMessage(chatId, { text: withSignature(`✅ Added new sudo: ${number}`, sender) })
      } else {
        await sock.sendMessage(chatId, { text: withSignature(`ℹ️ ${number} is already sudo.`, sender) })
      }
    }

    // Set sudo (replace entire list)
    if (cmd.startsWith(`${config.prefix}setsudo `)) {
      if (!isSudo(config, sender)) {
        await sock.sendMessage(chatId, { text: withSignature('⛔ Admin only command.', sender) })
        return
      }
      const numbers = text.slice(`${config.prefix}setsudo `.length).split(/[ ,]+/).map(n => n.replace(/[^0-9]/g, '')).filter(Boolean)
      if (!numbers.length) {
        await sock.sendMessage(chatId, { text: withSignature('⚠️ Provide at least one valid number.', sender) })
        return
      }
      config.sudo = numbers.map(n => `${n}@s.whatsapp.net`)
      db.set('sudo', config.sudo) // persist
      await sock.sendMessage(chatId, { text: withSignature(`🔄 Sudo list replaced:\n${numbers.join(', ')}`, sender) })
    }

    // Remove sudo
    if (cmd.startsWith(`${config.prefix}del sudo `)) {
      if (!isSudo(config, sender)) {
        await sock.sendMessage(chatId, { text: withSignature('⛔ Admin only command.', sender) })
        return
      }
      const number = text.slice(`${config.prefix}del sudo `.length).replace(/[^0-9]/g, '')
      const jid = `${number}@s.whatsapp.net`
      const index = config.sudo.indexOf(jid)
      if (index !== -1) {
        config.sudo.splice(index, 1)
        db.set('sudo', config.sudo) // persist
        await sock.sendMessage(chatId, { text: withSignature(`🗑️ Removed sudo: ${number}`, sender) })
      } else {
        await sock.sendMessage(chatId, { text: withSignature(`⚠️ ${number} not found in sudo list.`, sender) })
      }
    }

    // Show sudo list
    if (cmd === `${config.prefix}list sudo`) {
      const list = config.sudo.map(j => j.replace('@s.whatsapp.net','')).join(', ')
      await sock.sendMessage(chatId, { text: withSignature(`👑 Current sudo list:\n${list}`, sender) })
    }
  })
}