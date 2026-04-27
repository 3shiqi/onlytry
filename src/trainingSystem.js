export const APP_MODES = {
  TRAIN: 'TRAIN',
  PLAY: 'PLAY',
}

export const DEFAULT_CURRENT_TSS = 30
export const DEFAULT_EXTERNAL_LOGS = []
export const DEFAULT_APP_MODE = APP_MODES.TRAIN
export const REST_DAY_LABEL = 'REST (休息)'
export const RECOVERY_DAY_LABEL = '无痛重启 (Recovery)'

export const PRESCRIPTIONS = {
  '足踝稳定 (Ankle Stability)': {
    pattern: 'Stability',
    cscsQuota: { warmup: 3, strength: 2, core: 1 },
  },
  '肩胸功能 (Upper Mobility)': {
    pattern: 'Mobility',
    cscsQuota: { warmup: 3, strength: 2, core: 1 },
  },
  '上肢力量 (Upper Strength)': {
    pattern: 'Push/Pull',
    cscsQuota: { warmup: 2, strength: 4, core: 1 },
  },
  '下肢结构 (Lower Structure)': {
    pattern: 'Squat/Hinge',
    cscsQuota: { warmup: 2, strength: 4, core: 1 },
  },
  '动力链爆发 (Power)': {
    pattern: 'Plyo/Rotation',
    cscsQuota: { warmup: 2, power: 3, strength: 1 },
  },
  '心肺引擎 (ESD)': {
    pattern: 'Locomotion',
    cscsQuota: { warmup: 2, esd: 4 },
  },
}

export const CSCS_QUOTA_PHASE_MAP = {
  warmup: 'Warm-up',
  power: 'Power',
  strength: 'Strength',
  core: 'Core',
  esd: 'ESD',
}

const LOW_TSS_THEMES = [
  '动力链爆发 (Power)',
  '下肢结构 (Lower Structure)',
  '上肢力量 (Upper Strength)',
  '足踝稳定 (Ankle Stability)',
  '心肺引擎 (ESD)',
  '肩胸功能 (Upper Mobility)',
  RECOVERY_DAY_LABEL,
]

const MODERATE_TSS_THEMES = [
  '足踝稳定/肩胸功能',
  '下肢结构 (Lower Structure)',
  '上肢力量 (Upper Strength)',
  '动力链爆发 (Power)',
  '足踝稳定 (Ankle Stability)',
  '心肺引擎 (ESD)',
  RECOVERY_DAY_LABEL,
]

const HIGH_TSS_THEMES = [
  RECOVERY_DAY_LABEL,
  '肩胸功能 (Upper Mobility)',
  '足踝稳定 (Ankle Stability)',
  RECOVERY_DAY_LABEL,
  '上肢力量 (Upper Strength)',
  '下肢结构 (Lower Structure)',
  '心肺引擎 (ESD)',
]

function toFiniteNumber(value) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : 0
}

function roundToSingleDecimal(value) {
  return Math.round(value * 10) / 10
}

function resolveBaseThemes(tss) {
  const totalStressScore = toFiniteNumber(tss)

  if (totalStressScore > 80) {
    return [...HIGH_TSS_THEMES]
  }

  if (totalStressScore > 50) {
    return [...MODERATE_TSS_THEMES]
  }

  return [...LOW_TSS_THEMES]
}

function applyRestCadence(themes, totalDays = 7) {
  const projectedDays = []
  let themeIndex = 0

  for (let dayIndex = 0; dayIndex < totalDays; dayIndex += 1) {
    const nextTheme = themes[themeIndex] ?? themes[themes.length - 1] ?? REST_DAY_LABEL
    const shouldInsertRestDay =
      dayIndex % 3 === 2 && nextTheme !== RECOVERY_DAY_LABEL

    if (shouldInsertRestDay) {
      projectedDays.push(REST_DAY_LABEL)
      continue
    }

    projectedDays.push(nextTheme)
    themeIndex += 1
  }

  return projectedDays
}

export function calculatePlayTSS(durationMins, rpe) {
  const duration = toFiniteNumber(durationMins)
  const perceivedExertion = toFiniteNumber(rpe)
  return roundToSingleDecimal((duration * perceivedExertion) / 5)
}

export function calculateFluidCalendar(tss) {
  return applyRestCadence(resolveBaseThemes(tss), 7)
}

export function buildProjectedCalendarSlots(tss, totalDays) {
  const normalizedDays = Math.max(0, Number(totalDays) || 0)
  const cadence = calculateFluidCalendar(tss)

  return Array.from({ length: normalizedDays }, (_, index) => {
    if (cadence.length === 0) {
      return REST_DAY_LABEL
    }

    return cadence[index % cadence.length]
  })
}

export function calculateTrainTSS(sessionSummary = {}) {
  const estimatedTime = toFiniteNumber(sessionSummary.estimatedTime)
  const totalSets = toFiniteNumber(sessionSummary.totalSets)
  const effectiveMinutes = estimatedTime || Math.max(12, Math.round(totalSets * 1.5))
  const intensityMap = {
    恢复: 4,
    适中: 5,
    困难: 6,
  }
  const intensity = intensityMap[sessionSummary.difficultyStr] || 5

  return roundToSingleDecimal((effectiveMinutes * intensity) / 8)
}

export function normalizeCscsQuota(cscsQuota = {}) {
  return Object.entries(cscsQuota).reduce((normalizedQuota, [phaseKey, count]) => {
    const normalizedPhase = CSCS_QUOTA_PHASE_MAP[phaseKey]

    if (!normalizedPhase) {
      return normalizedQuota
    }

    normalizedQuota[normalizedPhase] = Number(count) || 0
    return normalizedQuota
  }, {})
}

export function getPrescriptionBackendParams(goal) {
  const prescription = PRESCRIPTIONS[goal]

  if (!prescription) {
    return null
  }

  return {
    ...prescription,
    phaseQuota: normalizeCscsQuota(prescription.cscsQuota),
  }
}
