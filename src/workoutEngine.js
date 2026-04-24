export const phaseOrder = ['Warm-up', 'Power', 'Strength', 'Core', 'ESD']

export const reservedFilters = {
  phase: null,
  pattern: null,
  plane: null,
  isNew: null,
}

export const defaultPreferences = {
  goal: 'strength',
  timeLimit: 30,
  fatigue: 4,
}

const quotaMap = {
  strength: { 'Warm-up': 2, Power: 1, Strength: 3, Core: 1, ESD: 0 },
  esd: { 'Warm-up': 2, Power: 1, Strength: 1, Core: 1, ESD: 2 },
  mobility: { 'Warm-up': 4, Power: 0, Strength: 1, Core: 2, ESD: 0 },
}

const themeMap = {
  strength: '神经募集与绝对力量',
  esd: '心肺耐力与高阶代谢',
  mobility: '关节活动与核心维稳',
}

function normalizePhase(value) {
  if (Array.isArray(value)) {
    return value
  }

  if (typeof value === 'string' && value.includes(',')) {
    return value.split(',').map((item) => item.trim())
  }

  return [value]
}

export function applyWorkoutFilters(actions, filters = {}) {
  return actions.filter((action) =>
    Object.entries(filters).every(([key, value]) => {
      if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) {
        return true
      }

      if (key === 'phase') {
        const phases = normalizePhase(action.phase)
        return Array.isArray(value) ? value.some((item) => phases.includes(item)) : phases.includes(value)
      }

      if (Array.isArray(value)) {
        return value.includes(action[key])
      }

      return action[key] === value
    }),
  )
}

function shuffleArray(items) {
  const shuffled = [...items]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const currentItem = shuffled[index]

    shuffled[index] = shuffled[swapIndex]
    shuffled[swapIndex] = currentItem
  }

  return shuffled
}

function countSets(plan) {
  return plan.reduce((sum, exercise) => sum + (exercise.sets || 0), 0)
}

function estimateDuration(totalSets) {
  return Math.round(totalSets * 1.5 + 3)
}

function trimPlanToTime(plan, timeLimit) {
  const maxSets = Math.max(8, Math.floor(timeLimit / 1.5))
  const trimmedPlan = plan.map((exercise) => ({ ...exercise }))
  const reductionPriority = ['ESD', 'Core', 'Warm-up', 'Strength']
  const dropPriority = ['ESD', 'Core', 'Warm-up']
  let totalSets = countSets(trimmedPlan)

  while (totalSets > maxSets) {
    let adjusted = false

    for (const phase of reductionPriority) {
      for (let index = trimmedPlan.length - 1; index >= 0; index -= 1) {
        const exercise = trimmedPlan[index]

        if (exercise.phase === phase && exercise.sets > 1) {
          exercise.sets -= 1
          totalSets -= 1
          adjusted = true
          break
        }
      }

      if (adjusted) {
        break
      }
    }

    if (adjusted) {
      continue
    }

    for (const phase of dropPriority) {
      let dropIndex = -1

      for (let index = trimmedPlan.length - 1; index >= 0; index -= 1) {
        if (trimmedPlan[index].phase === phase) {
          dropIndex = index
          break
        }
      }

      if (dropIndex !== -1) {
        totalSets -= trimmedPlan[dropIndex].sets || 0
        trimmedPlan.splice(dropIndex, 1)
        adjusted = true
        break
      }
    }

    if (!adjusted) {
      break
    }
  }

  return trimmedPlan
}

function describeDifficulty(averageDifficulty) {
  if (averageDifficulty >= 4) {
    return '困难'
  }

  if (averageDifficulty >= 2.5) {
    return '适中'
  }

  return '恢复'
}

export function generateWorkout(library, preferences = defaultPreferences, filters = reservedFilters) {
  const mergedPreferences = { ...defaultPreferences, ...preferences }
  const { goal, timeLimit, fatigue } = mergedPreferences
  const quota = quotaMap[goal] || quotaMap.strength
  const filteredLibrary = applyWorkoutFilters(library, filters)
  const safeLibrary = fatigue <= 2
    ? filteredLibrary.filter((exercise) => !exercise.isNew && (exercise.difficulty || 2) <= 3)
    : filteredLibrary
  const usableLibrary = safeLibrary.length > 0 ? safeLibrary : filteredLibrary
  const usedIds = new Set()
  const generatedPlan = []

  phaseOrder.forEach((phase) => {
    const neededCount = quota[phase] || 0

    if (neededCount === 0) {
      return
    }

    const availableActions = usableLibrary.filter(
      (exercise) =>
        normalizePhase(exercise.phase).includes(phase) &&
        !usedIds.has(exercise.id),
    )

    const selectedActions = shuffleArray(availableActions).slice(0, neededCount)

    selectedActions.forEach((exercise) => {
      usedIds.add(exercise.id)

      generatedPlan.push({
        ...exercise,
        autoRegressed: Boolean(fatigue <= 2 && exercise.reg),
        note: fatigue <= 2 && exercise.reg ? '系统因疲劳自动降阶' : null,
      })
    })
  })

  const timeCappedPlan = trimPlanToTime(generatedPlan, timeLimit)
  const totalSets = countSets(timeCappedPlan)
  const estimatedTime = estimateDuration(totalSets)
  const averageDifficulty = timeCappedPlan.length === 0
    ? 0
    : timeCappedPlan.reduce((sum, exercise) => sum + (exercise.difficulty || 2), 0) / timeCappedPlan.length

  return {
    plan: timeCappedPlan,
    tags: {
      theme: themeMap[goal],
      estimatedTime,
      difficultyStr: describeDifficulty(averageDifficulty),
      totalSets,
    },
    summary: {
      goal,
      fatigue,
      timeLimit,
      phaseBreakdown: phaseOrder
        .map((phase) => ({
          phase,
          count: timeCappedPlan.filter((exercise) => exercise.phase === phase).length,
          sets: timeCappedPlan
            .filter((exercise) => exercise.phase === phase)
            .reduce((sum, exercise) => sum + (exercise.sets || 0), 0),
        }))
        .filter((phaseBlock) => phaseBlock.count > 0),
    },
  }
}
