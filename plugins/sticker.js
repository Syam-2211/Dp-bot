import { writeFile } from "fs";
import { exec } from "child_process";
import path from "path";

export default {
  name: "sticker",
  execute: async (sock, msg, args) => {
    try {
      const jid = msg.key.remoteJid;

      // Check if the message has an image
      const imageMessage = msg.message?.imageMessage;
      if (!imageMessage) {
        await sock.sendMessage(jid, { text: "⚠️ Please reply with an image to convert into a sticker." });
        return;
      }

      // Download the image
      const buffer = await sock.downloadMediaMessage(msg);

      // Save temporarily
      const filePath = path.join(process.cwd(), "temp.jpg");
      writeFile(filePath, buffer, async (err) => {
        if (err) {
          console.error("❌ Error saving file:", err);
          await sock.sendMessage(jid, { text: "❌ Failed to save image." });
          return;
        }

        // Convert to sticker using ImageMagick (make sure it's installed in Termux)
        const stickerPath = path.join(process.cwd(), "sticker.webp");
        exec(`magick convert ${filePath} -resize 512x512 ${stickerPath}`, async (error) => {
          if (error) {
            console.error("❌ Error converting to sticker:", error);
            await sock.sendMessage(jid, { text: "❌ Failed to convert image to sticker." });
            return;
          }

          // Send sticker back
          await sock.sendMessage(jid, {
            sticker: { url: stickerPath },
          });

          // Watermark reply
          await sock.sendMessage(jid, { text: "✅ Sticker created by DP‑Bot™" });
        });
      });
    } catch (err) {
      console.error("❌ Sticker plugin error:", err);
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` });
    }
  },
};
