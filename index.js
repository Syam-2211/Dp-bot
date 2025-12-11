const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');
const send = require('./utils/send'); // global watermark wrapper

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
    printQRInTerminal: false // disables QR output
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

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    const prefix = process.env.PREFIX || "!";
    
    if (!body.startsWith(prefix)) return;

    const args = body.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    try {
      const plugin = require(`./plugins/${command}.js`);
      plugin.execute(sock, msg, args);
    } catch (e) {
      console.log(`❌ Command not found: ${command}`);
      await send(sock, msg.key.remoteJid, { text: `Unknown command: ${command}` });
    }
  });
}

startBot();

// Prevent early exit
setInterval(() => {}, 1000);
