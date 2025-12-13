const {
  default: makeWASocket,
  useMultiFileAuthState,
  generatePairingCode,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const fs = require("fs");
const path = require("path");
const send = require("./utils/send");

const BOT_WATERMARK = process.env.BOT_WATERMARK || "🕊🦋⃝♥⃝ѕиєнα🍁♥⃝🕊";
const PREFIX = process.env.PREFIX || "!";
const BOT_NUMBER = process.env.BOT_NUMBER || null;

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const sock = makeWASocket({
    auth: state,
    browser: ["Ubuntu", "Chrome", "22.04.64"]
  });

  sock.ev.on("creds.update", saveCreds);

  // 🔐 Trigger pairing code if not already paired
  if (!sock.authState.creds?.me && BOT_NUMBER) {
    try {
      const code = await generatePairingCode(sock, BOT_NUMBER);
      console.log(`🔗 Pairing Code for ${BOT_NUMBER}: ${code}`);
    } catch (err) {
      console.error("❌ Failed to generate pairing code:", err.message);
    }
  }

  // 🔄 Connection updates
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.log("✅ WhatsApp connection established");
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      if (reason !== DisconnectReason.loggedOut) {
        console.log("⚠️ Connection closed. Reconnecting...");
        startBot();
      } else {
        console.log("🔒 Logged out. Please re-scan pairing code.");
      }
    }
  });

  // 🧩 Plugin loader
  const plugins = {};
  const pluginDir = path.join(__dirname, "plugins");
  fs.readdirSync(pluginDir).forEach((file) => {
    if (file.endsWith(".js")) {
      try {
        const plugin = require(path.join(pluginDir, file));
        plugins[plugin.name] = plugin;
        console.log(`✅ Plugin loaded: ${plugin.name}`);
      } catch (err) {
        console.warn(`⚠️ Failed to load plugin ${file}:`, err.message);
      }
    }
  });

  // 📩 Message handler
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      "";

    if (!text.startsWith(PREFIX)) return;

    const args = text.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (plugins[command]) {
      try {
        await plugins[command].execute(sock, msg, args);
        if (plugins["logger"]) {
          await plugins["logger"].execute(sock, msg, command);
        }
      } catch (err) {
        console.error(`❌ Error in ${command}:`, err);
        await send(sock, msg.key.remoteJid, {
          text: `❌ Error: ${err.message}`
        });
      }
    }
  });
}

startBot();
