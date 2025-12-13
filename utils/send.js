export default async function send(sock, jid, message) {
  const watermark = process.env.BOT_WATERMARK || "🕊🦋⃝♥⃝ѕиєнα🍁♥⃝🕊";

  // Always append watermark to text replies
  const textWithWatermark = message.text
    ? `${message.text}\n\n${watermark}`
    : watermark;

  await sock.sendMessage(jid, {
    ...message,
    text: textWithWatermark
  });
}
