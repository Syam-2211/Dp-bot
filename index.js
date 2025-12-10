const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys')
const P = require('pino')
const http = require('http')

// Tiny HTTP server to keep Render/Railway happy
const PORT = process.env.PORT || 3000
http.createServer((_, res) => { res.writeHead(200); res.end('Bot is running'); }).listen(PORT)

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth')
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    logger: P({ level: 'info' }),
    printQRInTerminal: false // disable QR
  })

  // Pairing code login (first time only)
  if (!sock.authState.creds.registered) {
    const phoneNumber = process.env.PHONE_NUMBER || "91XXXXXXXXXX" // set your number in env
    const code = await sock.requestPairingCode(phoneNumber)
    console.log("🔑 Pairing code:", code)
    console.log("👉 On WhatsApp: Settings → Linked Devices → Link with code → enter this code")
  }

  sock.ev.on('creds.update', saveCreds)

  // Message handler
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message) return
    const text = m.message.conversation || m.message.extendedTextMessage?.text || ''
    const chatId = m.key.remoteJid

    if (!text.startsWith('!')) return
    const [cmd, ...args] = text.trim().slice(1).split(/\s+/)

    if (cmd === 'menu') {
      await sock.sendMessage(chatId, { text:
`📜 BOT MENU
──────────────
💼 Business Tools
• !catalog        → Show product catalog
• !status <id>    → Track order status
• !remind <time> <text> → Set reminders
• Multi-language replies (EN/ML)

🎉 Fun & Social
• !joke • !quote • !quiz • !rps • !dice • !meme
• Greetings → Auto reply to “good morning” / “good night”

🧠 Productivity
• !weather <city> • !news <topic> • !define <word>
• !translate <lang> <text> • !note <text> • !task add/list • !convert <amt> <from> <to>

👥 Group Management
• Welcome messages • Anti-spam • Anti-link • !poll "Q" opt1 opt2`
      })
    }

    else if (cmd === 'media') {
      await sock.sendMessage(chatId, { text:
`📥 MEDIA MENU
──────────────
📎 WhatsApp Media
• !download image/video/audio/doc

🌐 Social Media Links
• !download <YouTube|Instagram|Facebook|Twitter|TikTok URL>`
      })
    }

    else if (cmd === 'admin') {
      await sock.sendMessage(chatId, { text:
`🔧 ADMIN MENU
──────────────
🛡️ Mode Control
• !mode private → Bot replies only to sudo users
• !mode public  → Bot replies to everyone

🧰 Admin Commands
• !sudo • !shutdown • !restart • !broadcast <msg>
• !ban <jid> • !unban <jid> • !mute • !unmute
• !reload • !stats • !eval <code>`
      })
    }

    else if (cmd === 'ping') {
      await sock.sendMessage(chatId, { text: 'pong 🏓' })
    }
  })
}

startBot().catch(console.error)
