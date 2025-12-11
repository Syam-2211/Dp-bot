const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');

// Plugin loader
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
    // printQRInTerminal is deprecated — use connection.update instead
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr, pairingCode } = update;

    if (qr) {
      console.log('📲 Scan this QR to link WhatsApp:\n', qr);
    }

    if (pairingCode) {
      console.log('🔗 Pairing Code:', pairingCode);
    }

    const shouldReconnect = Boom.isBoom(lastDisconnect?.error)
      ? lastDisconnect.error.output.statusCode !== 401
      : true;

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
    // You can handle commands here later
  });
}

startBot();

// Prevent early exit
setInterval(() => {}, 1000);
