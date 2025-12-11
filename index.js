const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys')
const P = require('pino')
const http = require('http')
const fs = require('fs')
const path = require('path')
const config = require('./config')
const db = require('./database')

// Tiny HTTP server for Render/Railway
const PORT = process.env.PORT || 3000
http.createServer((_, res) => { res.writeHead(200); res.end('Bot is running'); }).listen(PORT)

// Load plugins dynamically
function loadPlugins(sock) {
  const pluginsDir = path.join(__dirname, 'plugins')
  fs.readdirSync(pluginsDir).forEach(file => {
    if (file.endsWith('.js')) {
      const plugin = require(path.join(pluginsDir, file))
      if (typeof plugin === 'function') {
        plugin(sock, config, db)
        console.log(`✅ Loaded plugin: ${file}`)
      }
    }
  })
}

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

  // Load all plugins
  loadPlugins(sock)
}

startBot().catch(console.error)
