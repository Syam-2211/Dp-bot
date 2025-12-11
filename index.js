const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');

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
    // Force pairing code instead of QR
    printQRInTerminal: false,
    mobile: { // mobile mode triggers pairing code
      client: 'android',
      version: [2, 2407, 3]
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, pairingCode } = update;

    if (pairingCode) {
      console.log('🔗 Pairing Code:', pairingCode);
    }

    const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;

    if (connection === 'close') {
      console.log('Connection closed. Reconnecting:', shouldReconnect);
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log('✅ WhatsApp connection established');
      loadPlugins();
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    console.log('📩 New message:', JSON.stringify(m, null, 2));
  });
}

startBot();

// Prevent early exit
setInterval(() => {}, 1000);
