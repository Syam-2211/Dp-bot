module.exports = {
  prefix: "!",
  phoneNumber: "91XXXXXXXXXX",
  sudo: ["91XXXXXXXXXX@s.whatsapp.net"],

  menus: {
    main: `📜 BOT MENU
──────────────
💼 Business Tools
• !catalog • !status <id> • !remind <time> <text>
🎉 Fun & Social
• !joke • !quote • !quiz • !rps • !dice • !meme
🧠 Productivity
• !weather • !news • !define • !translate • !note • !task • !convert
👥 Group Management
• Welcome • Anti-spam • Anti-link • !poll "Q" opt1 opt2`,

    media: `📥 MEDIA MENU
──────────────
📎 WhatsApp Media
• !download image/video/audio/doc
🌐 Social Media Links
• !download <YouTube|Instagram|Facebook|Twitter|TikTok URL>`,

    admin: `🔧 ADMIN MENU
──────────────
🛡️ Mode Control
• !mode private • !mode public
🧰 Admin Commands
• !sudo • !shutdown • !restart • !broadcast <msg>
• !ban • !unban • !mute • !unmute • !reload • !stats • !eval`
  }
}
