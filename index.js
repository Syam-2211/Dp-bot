const chalk = require('chalk')
const config = require('./config')
const db = require('./database')

function logWithBrand(message, success = true) {
  const now = new Date()
  const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const brand = `🕊🦋⃝♥⃝ѕиєнα🍁♥⃝🦋⃝🕊`
  const prefix = success ? chalk.green('✅') : chalk.red('❌')
  console.log(`${prefix} ${brand} | ${time} | ${message}`)
}

function loadPlugins(sock) {
  const plugins = [
    './plugins/alive',
    './plugins/info',
    './plugins/repo',
    './plugins/sticker',
    './plugins/convertVoice',
    './plugins/ping',
    './plugins/mention',
    './plugins/greetings',

    // New implementations
    './plugins/admin',     // Admin commands
    './plugins/convert',   // Convert commands
    './plugins/search',    // Search commands
    './plugins/ai',        // AI commands
    './plugins/download',  // Download commands
    './plugins/group'      // Group management
  ]

  plugins.forEach(path => {
    try {
      require(path)(sock, config, db)
      logWithBrand(`Loaded plugin: ${path}`, true)
    } catch (err) {
      logWithBrand(`Failed to load plugin: ${path}`, false)
      console.error(err)
    }
  })
}

module.exports = { loadPlugins }