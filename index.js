sock.ev.on('connection.update', (update) => {
  const { connection, lastDisconnect, qr, pairingCode } = update;

  if (qr) {
    console.log('📲 Scan this QR to link WhatsApp:\n', qr);
  }

  if (pairingCode) {
    console.log('🔗 Pairing Code:', pairingCode);
  }

  if (connection === 'close') {
    const shouldReconnect = (lastDisconnect?.error = Boom)?.output?.statusCode !== 401;
    console.log('Connection closed. Reconnecting:', shouldReconnect);
    if (shouldReconnect) startBot();
  } else if (connection === 'open') {
    console.log('✅ WhatsApp connection established');
    loadPlugins();
  }
});
