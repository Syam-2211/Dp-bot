// Import Baileys
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');

// Plugin loader (example: load all files in ./plugins)
function loadPlugins() {
  const pluginDir = './plugins';
  if (!fs.existsSync(pluginDir)) {
    console.log('⚠️ No plugins folder found');
    return 0;
  }
  const files = fs.readdirSync(pluginDir).filter(f => f.endsWith('.js'));
  files.forEach(file => {
    require(`${pluginDir}/${file}`);
  });
  console.log(`✅ Loaded ${files.length} plugins successfully`);
  return files.length;
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true, // shows QR in Render logs
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error = Boom)?.output?.statusCode !== 401;
      console.log('Connection closed. Reconnecting:', shouldReconnect);
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log('✅ WhatsApp connection established');
      loadPlugins();
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    console.log('📩 New message:', JSON.stringify(m, null, 2));
    // Here you can handle commands, watermark replies, etc.
  });
}

// Start bot
startBot();

// Prevent early exit
setInterval(() => {}, 1000);
