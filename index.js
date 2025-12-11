require('dotenv').config()
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys')
const Pino = require('pino')
const fs = require('fs')
const path = require('path')
const fse = require('fs-extra')
const config = require('./config')
const db = require('./database')
const { log } = require('./utils/logger')

// Ensure media folder exists
fse.ensureDirSync(path.join(__dirname, 'media'))
fse.ensureDirSync(path.join(__dirname, 'downloads'))
fse.ensureDirSync(path.join(__dirname, 'auth'))
fse.ensureDirSync(path.join(__dirname, 'plugins'))
fse.ensureDirSync(path.join(__dirname, 'utils'))

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth')
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    printQRInTerminal: true,
    auth: state,
    logger: Pino({ level: 'info' })
  })

  sock.ev.on('creds.update', saveCreds)

  // Auto-reconnect
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut)
      if (shouldReconnect) startBot()
    } else if (connection === 'open') {
      log('connected', `✅ ${config.botName} connected`)
      setBotProfilePicture(sock) // set PFP if file exists
      loadPlugins(sock)
    }
  })
}

function loadPlugins(sock) {
  // Register plugins
  require('./plugins/alive')(sock, config, db)
  require('./plugins/info')(sock, config, db)
  require('./plugins/repo')(sock, config, db)
  require('./plugins/admin')(sock, config, db)
  require('./plugins/convertVoice')(sock, config, db)
  require('./plugins/sticker')(sock, config, db)
  require('./plugins/greetings')(sock, config, db)
  // Add more plugin requires here
}

async function setBotProfilePicture(sock) {
  try {
    const pfpPath = path.join(__dirname, 'media', 'bot-pfp.jpg')
    if (fs.existsSync(pfpPath)) {
      const imageBuffer = fs.readFileSync(pfpPath)
      await sock.updateProfilePicture(sock.user.id, imageBuffer)
      log('branding', '✅ Bot profile picture updated')
    } else {
      log('branding', 'ℹ️ No bot-pfp.jpg found in /media — skipping PFP update')
    }
  } catch (err) {
    log('branding', `❌ Failed to set profile picture: ${err.message}`)
  }
}

startBot()
