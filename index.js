const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys')
const P = require('pino')
const http = require('http')
const db = require('./database')
const config = require('./config')

// Tiny HTTP server for Render/Railway
const PORT = process.env.PORT || 3000
http.createServer((_, res) => { res.writeHead(200); res.end('Bot is running'); }).listen(PORT)

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth')
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    logger: P({ level: 'info' }),
    printQRInTerminal: false
  })

  // Pairing code login
  if (!sock.authState.creds.registered) {
    const phoneNumber = process.env.PHONE_NUMBER || config.phoneNumber
    const code = await sock.requestPairingCode(phoneNumber)
    console.log("🔑 Pairing code:", code)
    console.log("👉 WhatsApp → Settings → Linked Devices → Link with code")
  }

  sock.ev.on('creds.update', saveCreds)

  // Message handler
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message) return
    const text = m.message.conversation || m.message.extendedTextMessage?.text || ''
    const chatId = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid

    if (!text.startsWith(config.prefix)) return
    const [cmd, ...args] = text.trim().slice(config.prefix.length).split(/\s+/)

    // Menus
    if (cmd === 'menu') {
      return sock.sendMessage(chatId, { text: config.menus.main })
    }
    if (cmd === 'media') {
      return sock.sendMessage(chatId, { text: config.menus.media })
    }
    if (cmd === 'admin') {
      return sock.sendMessage(chatId, { text: config.menus.admin })
    }

    // Admin commands (sudo only)
    if (config.sudo.includes(sender)) {
      if (cmd === 'shutdown') process.exit()
      if (cmd === 'restart') process.exit(1)
      if (cmd === 'broadcast') {
        const msg = args.join(' ')
        const chats = await sock.groupFetchAllParticipating()
        for (let id in chats) {
          await sock.sendMessage(id, { text: msg })
        }
      }
      if (cmd === 'ban') {
        db.addBan(args[0])
        await sock.sendMessage(chatId, { text: `User ${args[0]} banned ✅` })
      }
      if (cmd === 'unban') {
        db.removeBan(args[0])
        await sock.sendMessage(chatId, { text: `User ${args[0]} unbanned ✅` })
      }
    }

    // Fun commands
    if (cmd === 'joke') return sock.sendMessage(chatId, { text: "😂 Here's a random joke!" })
    if (cmd === 'quote') return sock.sendMessage(chatId, { text: "💡 Stay motivated, Syam!" })

    // Utility commands
    if (cmd === 'ping') return sock.sendMessage(chatId, { text: 'pong 🏓' })
  })
}

startBot().catch(console.error)
