import { makeWASocket, useMultiFileAuthState } from "@whiskeysockets/baileys";
import { loadPlugins } from "./loader.js";
import { logInfo, logSuccess, logError } from "./logger.js";

async function startBot() {
  // 🔑 Auth state stored in "auth" folder
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  // ⚡ Create socket
  const sock = makeWASocket({
    auth: state,
    syncFullHistory: false,
    shouldSyncHistoryMessage: false,
  });

  // 🔄 Keep session alive
  sock.ev.on("creds.update", saveCreds);

  // 📡 Connection logs
  sock.ev.on("connection.update", (update) => {
    const { qr, connection } = update;
    if (qr) logInfo(`Pairing Code: ${qr}`);
    if (connection === "open") logSuccess("Connected to WhatsApp!");
    if (connection === "close") logError("Connection closed, retrying...");
  });

  // 📦 Load plugins
  const plugins = await loadPlugins();

  // 📨 Dispatch messages to plugins
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || !msg.key.remoteJid) return;

    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
    if (!text) return;

    const [command, ...args] = text.trim().split(/\s+/);

    for (const plugin of plugins) {
      if (`!${plugin.name}` === command) {
        try {
          await plugin.execute(sock, msg, args);
        } catch (err) {
          logError(`Plugin ${plugin.name} failed`, err);
          await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error in ${plugin.name}` });
        }
      }
    }
  });
}

startBot();
