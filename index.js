import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { makeWASocket, useMultiFileAuthState } from "@whiskeysockets/baileys";
import send from "./utils/send.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadPlugins() {
  const plugins = {};
  const pluginDir = path.join(__dirname, "plugins");

  const files = fs.readdirSync(pluginDir).filter((file) => file.endsWith(".js"));

  for (const file of files) {
    try {
      const pluginPath = path.join(pluginDir, file);
      const plugin = await import(`file://${pluginPath}`);
      plugins[plugin.default.name] = plugin.default;
      console.log(`✅ Plugin loaded: ${plugin.default.name}`);
    } catch (err) {
      console.warn(`⚠️ Failed to load plugin ${file}:`, err.message);
    }
  }

  return plugins;
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");
  const sock = makeWASocket({
    auth: state,
    syncFullHistory: false,
    shouldSyncHistoryMessage: false,
  });

  sock.ev.on("creds.update", saveCreds);

  const plugins = await loadPlugins();

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || !msg.key.remoteJid) return;

    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
    if (!text || !text.startsWith("!")) return;

    const [cmd, ...args] = text.slice(1).split(" ");
    const plugin = plugins[cmd];

    if (plugin) {
      try {
        await plugin.execute(sock, msg, args);
      } catch (err) {
        console.error(`❌ Error in plugin ${cmd}:`, err.message);
        await send(sock, msg.key.remoteJid, { text: `❌ Error: ${err.message}` });
      }
    } else {
      await send(sock, msg.key.remoteJid, { text: `❓ Unknown command: !${cmd}` });
    }
  });
}

startBot();
