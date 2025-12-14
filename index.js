import { makeWASocket, useMultiFileAuthState } from "@whiskeysockets/baileys";

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const sock = makeWASocket({
    auth: state,
    syncFullHistory: false,
    shouldSyncHistoryMessage: false,
  });

  sock.ev.on("creds.update", saveCreds);

  // 🔄 Debug connection updates
  sock.ev.on("connection.update", (update) => {
    const { connection, qr } = update;
    if (qr) {
      console.log("🔗 Pairing Code:", qr);
    }
    if (connection === "open") {
      console.log("✅ Connected to WhatsApp!");
    }
    if (connection === "close") {
      console.log("❌ Connection closed, retrying...");
      startBot(); // auto-reconnect
    }
  });

  // 🧪 Simple test command
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || !msg.key.remoteJid) return;

    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
    if (text === "!alive") {
      await sock.sendMessage(msg.key.remoteJid, { text: "✅ Bot is alive with watermark!" });
    }
  });
}

startBot();
