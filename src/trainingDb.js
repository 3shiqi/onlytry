import Dexie from 'dexie'

export const trainingDb = new Dexie('onlytry_training')

trainingDb.version(1).stores({
  history: '++id, date, dateKey, theme',
  activityLogs: '++id, date, dateKey, sportType',
})

function toFiniteNumber(value) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : 0
}

function roundToSingleDecimal(value) {
  return Math.round(value * 10) / 10
}

export function toDateKey(value) {
  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    const fallbackDate = new Date()
    return `${fallbackDate.getFullYear()}-${String(fallbackDate.getMonth() + 1).padStart(2, '0')}-${String(fallbackDate.getDate()).padStart(2, '0')}`
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function toIsoString(value) {
  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString()
  }

  return date.toISOString()
}

function sortByDateAsc(leftEntry, rightEntry) {
  return new Date(leftEntry.date).getTime() - new Date(rightEntry.date).getTime()
}

export function normalizeActivityLog(entry = {}) {
  const date = toIsoString(entry.date)

  return {
    date,
    dateKey: toDateKey(date),
    sportType: entry.sportType ?? '',
    duration: toFiniteNumber(entry.duration),
    rpe: toFiniteNumber(entry.rpe),
    tssEarned: roundToSingleDecimal(toFiniteNumber(entry.tssEarned)),
    type: 'PLAY',
  }
}

export function normalizeHistoryLog(entry = {}) {
  const date = toIsoString(entry.date)

  return {
    date,
    dateKey: toDateKey(date),
    theme: entry.theme ?? '',
    goal: entry.goal ?? '',
    difficultyStr: entry.difficultyStr ?? '',
    estimatedTime: toFiniteNumber(entry.estimatedTime),
    totalSets: toFiniteNumber(entry.totalSets),
    tssEarned: roundToSingleDecimal(toFiniteNumber(entry.tssEarned)),
    type: 'TRAIN',
  }
}

export async function addActivityLog(entry) {
  const normalizedEntry = normalizeActivityLog(entry)
  const id = await trainingDb.activityLogs.add(normalizedEntry)

  return {
    ...normalizedEntry,
    id,
  }
}

export async function addHistoryLog(entry) {
  const normalizedEntry = normalizeHistoryLog(entry)
  const id = await trainingDb.history.add(normalizedEntry)

  return {
    ...normalizedEntry,
    id,
  }
}

export async function getAllLogs() {
  const [history, activityLogs] = await Promise.all([
    trainingDb.history.toArray(),
    trainingDb.activityLogs.toArray(),
  ])

  return {
    history: [...history].sort(sortByDateAsc),
    activityLogs: [...activityLogs].sort(sortByDateAsc),
  }
}

export async function getMonthLogs(year, month) {
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0)
  const startKey = toDateKey(startDate)
  const endKey = toDateKey(endDate)

  const [history, activityLogs] = await Promise.all([
    trainingDb.history.where('dateKey').between(startKey, endKey, true, true).toArray(),
    trainingDb.activityLogs.where('dateKey').between(startKey, endKey, true, true).toArray(),
  ])

  return {
    history: [...history].sort(sortByDateAsc),
    activityLogs: [...activityLogs].sort(sortByDateAsc),
  }
}
