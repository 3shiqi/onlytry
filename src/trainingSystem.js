export const APP_MODES = {
  TRAIN: 'TRAIN',
  PLAY: 'PLAY',
}

export const DEFAULT_CURRENT_TSS = 30
export const DEFAULT_EXTERNAL_LOGS = []
export const DEFAULT_APP_MODE = APP_MODES.TRAIN

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

const LOW_TSS_CALENDAR = [
  '动力链爆发 (Power)',
  '下肢结构 (Lower Structure)',
  '上肢力量 (Upper Strength)',
  '足踝稳定 (Ankle Stability)',
  '心肺引擎 (ESD)',
  '肩胸功能 (Upper Mobility)',
  '无痛重启 (Recovery)',
]

const MODERATE_TSS_CALENDAR = [
  '足踝稳定/肩胸功能',
  '下肢结构 (Lower Structure)',
  '上肢力量 (Upper Strength)',
  '动力链爆发 (Power)',
  '足踝稳定 (Ankle Stability)',
  '心肺引擎 (ESD)',
  '无痛重启 (Recovery)',
]

const HIGH_TSS_CALENDAR = [
  '无痛重启 (Recovery)',
  '肩胸功能 (Upper Mobility)',
  '足踝稳定 (Ankle Stability)',
  '无痛重启 (Recovery)',
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

export function calculatePlayTSS(durationMins, rpe) {
  const duration = toFiniteNumber(durationMins)
  const perceivedExertion = toFiniteNumber(rpe)
  return roundToSingleDecimal((duration * perceivedExertion) / 5)
}

export function calculateFluidCalendar(tss) {
  const totalStressScore = toFiniteNumber(tss)

  if (totalStressScore > 80) {
    return [...HIGH_TSS_CALENDAR]
  }

  if (totalStressScore > 50) {
    return [...MODERATE_TSS_CALENDAR]
  }

  return [...LOW_TSS_CALENDAR]
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
