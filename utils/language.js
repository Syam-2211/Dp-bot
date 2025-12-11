// Simple language helper (extend as needed)
const strings = {
  en: {
    alive: 'is Alive and running smoothly!',
    goodMorning: 'Good Morning!',
    goodAfternoon: 'Good Afternoon!',
    goodEvening: 'Good Evening!',
    goodNight: 'Good Night!',
    weekendVibes: 'Weekend Vibes!'
  },
  ml: {
    alive: 'ജീവിച്ചിരിക്കുന്നു, എല്ലാം നന്നായി പ്രവർത്തിക്കുന്നു!',
    goodMorning: 'ശുഭോദയം!',
    goodAfternoon: 'ശുഭ സുപ്രഭാതം!',
    goodEvening: 'ശുഭ സായാഹ്നം!',
    goodNight: 'ശുഭ രാത്രി!',
    weekendVibes: 'വീക്കൻഡ് വൈബ്സ്!'
  }
}

function t(lang = 'en', key) {
  return (strings[lang] && strings[lang][key]) || strings.en[key] || key
}

module.exports = { t }
