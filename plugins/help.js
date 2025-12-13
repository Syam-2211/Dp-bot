import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import send from "../utils/send.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  name: "help",
  execute: async (sock, msg) => {
    const jid = msg.key.remoteJid;
    const pluginDir = path.join(__dirname);

    // Read all plugins in the folder
    const commands = fs
      .readdirSync(pluginDir)
      .filter((file) => file.endsWith(".js"))
      .map((file) => file.replace(".js", ""))
      .filter((name) => name !== "logger"); // hide internal plugins

    const helpText = `🧩 Available Commands:\n\n${commands
      .map((cmd) => `• !${cmd}`)
      .join("\n")}`;

    await send(sock, jid, { text: helpText });
  }
};
