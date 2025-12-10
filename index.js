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

  // Automation: scheduled greetings
  setInterval(async () => {
    const hour = new Date().getHours()
    if (hour === 8) {
      await sock.sendMessage(config.defaultGroup, { text: "🌞 Good morning everyone!" })
    }
    if (hour === 22) {
      await sock.sendMessage(config.defaultGroup, { text: "🌙 Good night, sleep well!" })
    }
  }, 60 * 60 * 1000) // check hourly

  // Automation: daily joke drop
  setInterval(async () => {
    await sock.sendMessage(config.defaultGroup, { text: "😂 Daily Joke: Why don’t programmers like nature? Too many bugs!" })
  }, 24 * 60 * 60 * 1000) // every 24h

  // Message handler
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message) return
    const text = m.message.conversation || m.message.extendedTextMessage?.text || ''
    const chatId = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid

    // Keyword automation
    if (/catalog/i.test(text)) {
      return sock.sendMessage(chatId, { text: "🛍️ Use !catalog to view our products." })
    }
    if (/help/i.test(text)) {
      return sock.sendMessage(chatId, { text: "🤝 Type !menu to see all commands." })
    }

    // Anti-link moderation
    if (/https?:\/\//i.test(text) && !config.allowLinks) {
      await sock.sendMessage(chatId, { text: "🚫 Links are not allowed here!" })
      db.addBan(sender)
    }

    // Command handling
    if (!text.startsWith(config.prefix)) return
    const [cmd, ...args] = text.trim().slice(config.prefix.length).split(/\s+/)

    if (cmd === 'menu') return sock.sendMessage(chatId, { text: config.menus.main })
    if (cmd === 'media') return sock.sendMessage(chatId, { text: config.menus.media })
    if (cmd === 'admin') return sock.sendMessage(chatId, { text: config.menus.admin })

    // Fun commands
    if (cmd === 'joke') return sock.sendMessage(chatId, { text: "😂 Random joke: I told my computer I needed a break, and it said 'No problem, I’ll go to sleep!'" })
    if (cmd === 'quote') return sock.sendMessage(chatId, { text: "💡 Quote: Success is not final, failure is not fatal: it is the courage to continue that counts." })

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
    }
  })
}

startBot().catch(console.error)
