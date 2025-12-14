import { writeFile } from "fs";
import { exec } from "child_process";
import path from "path";

export default {
  name: "sticker",
  execute: async (sock, msg, args) => {
    try {
      const jid = msg.key.remoteJid;
      const imageMessage = msg.message?.imageMessage;
      if (!imageMessage) {
        await sock.sendMessage(jid, { text: "⚠️ Reply with an image to make a sticker." });
        return;
      }

      const buffer = await sock.downloadMediaMessage(msg);
      const filePath = path.join(process.cwd(), "temp.jpg");
      writeFile(filePath, buffer, async (err) => {
        if (err) {
          await sock.sendMessage(jid, { text: "❌ Failed to save image." });
          return;
        }

        const stickerPath = path.join(process.cwd(), "sticker.webp");
        exec(`magick ${filePath} -resize 512x512 ${stickerPath}`, async (error) => {
          if (error) {
            await sock.sendMessage(jid, { text: "❌ Failed to convert image to sticker." });
            return;
          }

          await sock.sendMessage(jid, { sticker: { url: stickerPath } });
          await sock.sendMessage(jid, { text: "✅ Sticker created by DP‑Bot™" });
        });
      });
    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` });
    }
  },
};
