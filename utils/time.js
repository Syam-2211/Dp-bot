function getTimeSlot(date = new Date()) {
  const hour = date.getHours()
  if (hour >= 6 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 23) return 'evening'
  return 'night'
}

function isWeekend(date = new Date()) {
  const day = date.getDay()
  return day === 0 || day === 6
}

module.exports = { getTimeSlot, isWeekend }
