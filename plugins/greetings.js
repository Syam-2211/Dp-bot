const { withSignature } = require('../utils/signature')

module.exports = (sock, config, db) => {
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message) return
    const chatId = m.key.remoteJid
    const text = m.message.conversation || m.message.extendedTextMessage?.text || ''
    const cmd = text.trim().toLowerCase()
    const sender = m.key.participant || m.key.remoteJid

    // Unified menu
    if (cmd === `${config.prefix}menu`) {
      const menu = `📜 ${config.botName} MENU
──────────────────────

🔧 Group Menu → ${config.prefix}menu group
🔍 Search Menu → ${config.prefix}menu search
📥 Download Menu → ${config.prefix}menu download
🎨 Convert Menu → ${config.prefix}menu convert
🤖 AI Menu → ${config.prefix}menu ai
🛡️ Admin Menu → ${config.prefix}menu admin

Type a sub‑menu command to see details.`
      await sock.sendMessage(chatId, { text: withSignature(menu, sender) })
    }

    // Sub menus
    if (cmd === `${config.prefix}menu group`) {
      const groupMenu = `🔧 Group Menu
• ${config.prefix}kick • ${config.prefix}add • ${config.prefix}promote • ${config.prefix}demote
• ${config.prefix}welcome • ${config.prefix}left • ${config.prefix}mute • ${config.prefix}antilink
• ${config.prefix}groupinfo • ${config.prefix}tagall • ${config.prefix}hidetag`
      await sock.sendMessage(chatId, { text: withSignature(groupMenu, sender) })
    }

    if (cmd === `${config.prefix}menu search`) {
      const searchMenu = `🔍 Search Menu
• ${config.prefix}anime • ${config.prefix}manga • ${config.prefix}imdb • ${config.prefix}ytsearch
• ${config.prefix}tiktoksearch • ${config.prefix}pinterest • ${config.prefix}wallpaper • ${config.prefix}wikipedia
• ${config.prefix}lyrics • ${config.prefix}weather`
      await sock.sendMessage(chatId, { text: withSignature(searchMenu, sender) })
    }

    if (cmd === `${config.prefix}menu download`) {
      const downloadMenu = `📥 Download Menu
• ${config.prefix}play • ${config.prefix}ytaudio • ${config.prefix}ytvideo
• ${config.prefix}tiktokmp4 • ${config.prefix}tiktokmp3 • ${config.prefix}instagram • ${config.prefix}facebook
• ${config.prefix}mediafire • ${config.prefix}gitclone`
      await sock.sendMessage(chatId, { text: withSignature(downloadMenu, sender) })
    }

    if (cmd === `${config.prefix}menu convert`) {
      const convertMenu = `🎨 Convert Menu
• ${config.prefix}sticker • ${config.prefix}toimage • ${config.prefix}tourl • ${config.prefix}toaudio
• ${config.prefix}bass • ${config.prefix}nightcore • ${config.prefix}reverse • ${config.prefix}robot`
      await sock.sendMessage(chatId, { text: withSignature(convertMenu, sender) })
    }

    if (cmd === `${config.prefix}menu ai`) {
      const aiMenu = `🤖 AI Menu
• ${config.prefix}ask <question>
• ${config.prefix}imagine <prompt>
• ${config.prefix}translate <text>
• ${config.prefix}summarize <text>
• ${config.prefix}quiz <topic>`
      await sock.sendMessage(chatId, { text: withSignature(aiMenu, sender) })
    }

    if (cmd === `${config.prefix}menu admin`) {
      const adminMenu = `🛡️ Admin Menu
• ${config.prefix}broadcast <msg>
• ${config.prefix}stats
• ${config.prefix}ban • ${config.prefix}unban
• ${config.prefix}shutdown • ${config.prefix}restart
• ${config.prefix}mode private • ${config.prefix}mode public`
      await sock.sendMessage(chatId, { text: withSignature(adminMenu, sender) })
    }
  })
}
