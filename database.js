const fse = require('fs-extra')
const path = require('path')

const dbPath = path.join(__dirname, 'ultra-db.json')
if (!fse.existsSync(dbPath)) {
  fse.writeJsonSync(dbPath, { bans: [], notes: [], reminders: [], stats: { commands: 0 } }, { spaces: 2 })
}

function read() { return fse.readJsonSync(dbPath) }
function write(data) { return fse.writeJsonSync(dbPath, data, { spaces: 2 }) }

module.exports = {
  get: (key) => read()[key],
  set: (key, value) => {
    const data = read()
    data[key] = value
    write(data)
  },
  push: (key, value) => {
    const data = read()
    data[key] = data[key] || []
    data[key].push(value)
    write(data)
  },
  incCommand: () => {
    const data = read()
    data.stats = data.stats || { commands: 0 }
    data.stats.commands++
    write(data)
  }
}
