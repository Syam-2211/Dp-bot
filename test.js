import { makeWASocket, useMultiFileAuthState } from "@whiskeysockets/baileys";

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");
  const sock = makeWASocket({ auth: state });

  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("connection.update", (update) => {
    console.log("🔄 Connection update:", update);
  });
}

start();
