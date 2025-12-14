import { makeWASocket, useMultiFileAuthState } from "@whiskeysockets/baileys";

async function startBot() {
  // 🔑 Auth state stored in "auth" folder
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  // ⚡ Create socket with required config
  const sock = makeWASocket({
    auth: state,
    syncFullHistory: false,
    shouldSyncHistoryMessage: false,
  });

  // 🔄 Keep session alive
  sock.ev.on("creds.update", saveCreds);

  // 🧪 Debug connection updates
  sock.ev.on("connection.update", (update) => {
    console.log("🔄 Connection update:", update);
  });

  // ✅ Simple test command
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
