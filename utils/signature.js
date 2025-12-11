const config = require('../config')

function withSignature(text, senderId) {
  const userTag = (senderId || '').split('@')[0] || 'User'
  const signature = config.signature.replace('{user}', userTag)
  return `${text}\n\n${signature}`
}

module.exports = { withSignature }
