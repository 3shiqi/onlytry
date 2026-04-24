import { useEffect, useState } from 'react'
import {
  ArrowDown,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Gauge,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { fullActionLibrary } from './actionLibrary'
import {
  defaultPreferences,
  generateWorkout,
  reservedFilters,
} from './workoutEngine'

const goalOptions = [
  { value: 'strength', label: '力量' },
  { value: 'esd', label: '代谢' },
  { value: 'mobility', label: '活动' },
]

const timeOptions = [
  { value: 30, label: '30m' },
  { value: 45, label: '45m' },
  { value: 60, label: '60m' },
]

const fatigueOptions = [
  { value: 5, label: '5 好' },
  { value: 4, label: '4 稳' },
  { value: 3, label: '3 中' },
  { value: 2, label: '2 累' },
  { value: 1, label: '1 恢复' },
]

const emptyWorkTimerState = {
  isRunning: false,
  remainingSeconds: 0,
  totalSeconds: 0,
  runId: 0,
}

const emptyRestState = {
  isRunning: false,
  remainingSeconds: 0,
  totalSeconds: 0,
  restType: null,
  action: null,
  runId: 0,
}

const HOME_SHELL_TOP_OFFSET = 92
const HOME_SHELL_BOTTOM_NAV_HEIGHT = 86
const HOME_SHELL_CONTENT_BOTTOM_OFFSET = 222

function formatTimerValue(seconds) {
  const clampedSeconds = Math.max(0, seconds)
  const minutes = Math.floor(clampedSeconds / 60)
  const remainingSeconds = clampedSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

function getExerciseDurationSeconds(exercise) {
  if (!exercise?.reps) {
    return null
  }

  const normalizedReps = exercise.reps.replace(/\s+/g, '')

  if (!/(秒|分钟|min)/i.test(normalizedReps)) {
    return null
  }

  const match = normalizedReps.match(/(\d+)/)

  if (!match) {
    return null
  }

  const numericValue = Number(match[1])

  if (Number.isNaN(numericValue)) {
    return null
  }

  if (/(分钟|min)/i.test(normalizedReps)) {
    return numericValue * 60
  }

  return numericValue
}

function getRestDurationSeconds(exercise, restType) {
  const rawValue = restType === 'inter' ? exercise?.restInter : exercise?.restIntra
  const numericValue = Number(rawValue)

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return 0
  }

  return numericValue
}

function buildPrimaryMetric(exercise, workTimerState) {
  if (workTimerState.isRunning) {
    return {
      label: 'Time',
      value: formatTimerValue(workTimerState.remainingSeconds),
    }
  }

  if (exercise.weight) {
    return {
      label: 'Load / Reps',
      value: `${exercise.weight} × ${exercise.reps}`,
    }
  }

  return {
    label: exercise.reps.includes('秒') ? 'Time' : 'Reps',
    value: exercise.reps,
  }
}

function IllustrationPlaceholder({ isResting }) {
  return (
    <div
      id="video-container"
      className={`relative flex min-h-[220px] items-center justify-center overflow-hidden rounded-[30px] border border-dashed ${
        isResting ? 'border-[#CFE1FF] bg-[#F4F9FF]' : 'border-[#E2E8F0] bg-[#F8FAFC]'
      }`}
    >
      <div className="absolute inset-x-8 bottom-7 h-px bg-[#E2E8F0]" />
      <div className="relative h-36 w-40">
        <div className="absolute left-1/2 top-0 h-10 w-10 -translate-x-1/2 rounded-full border-2 border-[#CBD5E1] bg-white" />
        <div className="absolute left-1/2 top-10 h-12 w-[2px] -translate-x-1/2 bg-[#94A3B8]" />
        <div className="absolute left-[48%] top-[3.1rem] h-[2px] w-14 -translate-x-full -rotate-[22deg] bg-[#94A3B8]" />
        <div
          className={`absolute left-[52%] top-[3.1rem] h-[2px] w-14 rotate-[26deg] ${
            isResting ? 'bg-[#60A5FA]' : 'bg-[#22C55E]'
          }`}
        />
        <div className="absolute left-[49%] top-[5.6rem] h-14 w-[2px] -translate-x-1/2 -rotate-[18deg] bg-[#94A3B8]" />
        <div
          className={`absolute left-[51%] top-[5.2rem] h-16 w-[2px] -translate-x-1/2 rotate-[28deg] ${
            isResting ? 'bg-[#60A5FA]' : 'bg-[#22C55E]'
          }`}
        />
        <div
          className={`absolute right-2 top-10 h-12 w-12 rounded-full border ${
            isResting ? 'border-[#DBEAFE] bg-[#EFF6FF]' : 'border-[#DCFCE7] bg-[#F0FDF4]'
          }`}
        />
        <div
          className={`absolute right-5 top-[3.8rem] h-2 w-2 rounded-full ${
            isResting ? 'bg-[#60A5FA]' : 'bg-[#22C55E]'
          }`}
        />
      </div>
    </div>
  )
}

function ProtocolStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[24px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
      <div className="flex items-center gap-2 text-[#94A3B8]">
        <Icon className="h-4 w-4" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em]">{label}</p>
      </div>
      <p className="mt-3 text-lg font-black tracking-[-0.03em] text-[#1A1A1A]">{value}</p>
    </div>
  )
}

function PhaseStrip({ phaseBreakdown }) {
  return (
    <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-5">
      <div className="flex items-center gap-2 text-[#94A3B8]">
        <Sparkles className="h-4 w-4" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em]">Phase Mix</p>
      </div>

      <div className="mt-4 space-y-3">
        {phaseBreakdown.map((item) => (
          <div key={item.phase} className="flex items-center justify-between text-sm">
            <p className="font-semibold text-[#1A1A1A]">{item.phase}</p>
            <p className="text-[#64748B]">
              {item.count} 动作 · {item.sets} 组
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function TopTagBar({
  preferences,
  activeMenu,
  onToggleMenu,
  onSelectOption,
  onRefresh,
}) {
  const menuMap = {
    goal: {
      title: 'Goal',
      value: preferences.goal,
      options: goalOptions,
    },
    timeLimit: {
      title: 'Duration',
      value: preferences.timeLimit,
      options: timeOptions,
    },
    fatigue: {
      title: 'Fatigue',
      value: preferences.fatigue,
      options: fatigueOptions,
    },
  }
  const chips = [
    {
      key: 'goal',
      display: goalOptions.find((option) => option.value === preferences.goal)?.label ?? '力量',
    },
    {
      key: 'timeLimit',
      display: `${preferences.timeLimit}m`,
    },
    {
      key: 'fatigue',
      display:
        fatigueOptions.find((option) => option.value === preferences.fatigue)?.label ?? '4 稳',
    },
  ]
  const currentMenu = activeMenu ? menuMap[activeMenu] : null

  return (
    <div className="relative z-20">
      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => onToggleMenu(chip.key)}
              className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-2 text-sm font-semibold transition ${
                activeMenu === chip.key
                  ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                  : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#1A1A1A]'
              }`}
            >
              <span>{chip.display}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onRefresh}
          aria-label="Refresh plan"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[#1A1A1A] transition hover:bg-[#F8FAFC]"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <AnimatePresence>
        {currentMenu ? (
          <motion.div
            key={currentMenu.title}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 top-full mt-3 rounded-[24px] border border-[#E2E8F0] bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#94A3B8]">
              {currentMenu.title}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {currentMenu.options.map((option) => {
                const isActive = option.value === currentMenu.value

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onSelectOption(activeMenu, option.value)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                        : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]'
                    }`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function ExercisePanel({
  exercise,
  currentSetIndex,
  totalExercises,
  currentExerciseIndex,
  isRegressed,
  onRegression,
  workTimerState,
  restState,
}) {
  const isResting = restState.isRunning
  const primaryMetric = buildPrimaryMetric(exercise, workTimerState)
  const usesRegression = exercise.autoRegressed || isRegressed
  const completedSetCount = Math.min(currentSetIndex, exercise.sets)
  const nextSetNumber = Math.min(exercise.sets, currentSetIndex + 1)
  const timerProgressWidth = workTimerState.totalSeconds
    ? `${((workTimerState.totalSeconds - workTimerState.remainingSeconds) / workTimerState.totalSeconds) * 100}%`
    : '0%'

  let helperText = exercise.instruct

  if (isResting) {
    helperText =
      restState.restType === 'inter'
        ? currentExerciseIndex >= totalExercises - 1 && completedSetCount >= exercise.sets
          ? '最后一段休息结束后会进入本次训练总结。'
          : '动作间恢复中，结束后会自动滑到下一个动作。'
        : `组间恢复中，结束后自动进入第 ${nextSetNumber} 组。`
  } else if (workTimerState.isRunning) {
    helperText = '当前动作为计时模式，倒计时结束后会自动结算这一组。'
  } else if (exercise.autoRegressed) {
    helperText = exercise.note
  } else if (isRegressed) {
    helperText = `已切换为降阶动作，当前保持：${exercise.reg}`
  }

  const statusLabel = isResting
    ? restState.restType === 'inter'
      ? 'Transition Rest'
      : 'Set Rest'
    : workTimerState.isRunning
      ? `Set ${completedSetCount + 1} Live`
      : `Set ${nextSetNumber} Ready`

  return (
    <motion.section
      key={exercise.id}
      initial={{ x: 56, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -56, opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-1 flex-col"
    >
      <IllustrationPlaceholder isResting={isResting} />

      <div className="mt-8 text-center">
        <div className="flex items-start justify-center gap-2">
          <h1 className="max-w-[15rem] text-3xl font-black leading-tight tracking-[-0.04em] text-[#1A1A1A]">
            {usesRegression ? exercise.reg : exercise.name}
          </h1>
          <button
            type="button"
            onClick={onRegression}
            disabled={!exercise.reg || usesRegression || workTimerState.isRunning || isResting}
            aria-label={usesRegression ? 'Regression active' : 'Switch to regression'}
            className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#94A3B8] transition hover:bg-[#F8FAFC] hover:text-[#64748B] disabled:cursor-default disabled:text-[#22C55E]"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        </div>

        <p className="mx-auto mt-3 max-w-[15rem] text-sm leading-6 text-[#64748B]">
          {helperText}
        </p>

        {workTimerState.isRunning ? (
          <div className="mx-auto mt-4 max-w-[14rem]">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
              <motion.div
                className="h-full rounded-full bg-[#22C55E]"
                animate={{ width: timerProgressWidth }}
                transition={{ duration: 0.2, ease: 'linear' }}
              />
            </div>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#22C55E]">
              {statusLabel}
            </p>
          </div>
        ) : (
          <p
            className={`mt-4 text-xs font-semibold uppercase tracking-[0.24em] ${
              isResting ? 'text-[#60A5FA]' : 'text-[#94A3B8]'
            }`}
          >
            {statusLabel}
          </p>
        )}
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#94A3B8]">
            {primaryMetric.label}
          </p>
          <p className="mt-3 text-5xl font-black tracking-[-0.05em] text-[#1A1A1A]">
            {primaryMetric.value}
          </p>
        </div>
      </div>

      <div className="pb-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#94A3B8]">
          Exercise {currentExerciseIndex + 1} / {totalExercises}
        </p>
        <p className="mt-2 text-base font-semibold text-[#1A1A1A]">
          Sets completed {completedSetCount} / {exercise.sets}
        </p>
      </div>
    </motion.section>
  )
}

function RestDial({ restState, onSkip }) {
  const progress = restState.totalSeconds
    ? (restState.totalSeconds - restState.remainingSeconds) / restState.totalSeconds
    : 0
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)
  const label = restState.restType === 'inter' ? 'MOVE REST' : 'SET REST'

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-[#BFDBFE] bg-white shadow-[0_12px_30px_rgba(96,165,250,0.16)]">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#DBEAFE" strokeWidth="6" />
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#60A5FA"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            animate={{ strokeDashoffset }}
            initial={false}
            transition={{ duration: 0.35, ease: 'linear' }}
          />
        </svg>

        <div className="relative text-center">
          <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#60A5FA]">
            {label}
          </p>
          <p className="mt-1 text-xl font-black tracking-[-0.04em] text-[#1A1A1A]">
            {formatTimerValue(restState.remainingSeconds)}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onSkip}
        className="rounded-full border border-[#BFDBFE] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2563EB] transition hover:bg-[#EFF6FF]"
      >
        Skip Rest
      </button>
    </div>
  )
}

function CompletionPanel({ sessionBundle, regressedCount }) {
  const { plan, tags, summary } = sessionBundle

  return (
    <motion.section
      key="session-complete"
      initial={{ x: 56, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -56, opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-1 flex-col items-center justify-center text-center"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F0FDF4] text-[#22C55E]">
        <CheckCircle2 className="h-10 w-10" />
      </div>
      <h1 className="mt-8 text-3xl font-black tracking-[-0.04em] text-[#1A1A1A]">
        Session Complete
      </h1>
      <p className="mt-3 max-w-[16rem] text-sm leading-6 text-[#64748B]">
        {plan.length} movements finished. Regression used on {regressedCount} exercise
        {regressedCount === 1 ? '' : 's'}.
      </p>

      <div className="mt-8 grid w-full grid-cols-3 gap-3">
        <ProtocolStat icon={Clock3} label="Time" value={`~${tags.estimatedTime} min`} />
        <ProtocolStat icon={Gauge} label="Load" value={tags.difficultyStr} />
        <ProtocolStat icon={Sparkles} label="Volume" value={`${tags.totalSets} 组`} />
      </div>

      <div className="mt-6 w-full">
        <PhaseStrip phaseBreakdown={summary.phaseBreakdown} />
      </div>
    </motion.section>
  )
}

function EmptyPanel() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-black tracking-[-0.04em] text-[#1A1A1A]">
        No Session Loaded
      </h1>
      <p className="mt-3 max-w-[15rem] text-sm leading-6 text-[#64748B]">
        The reserved filter interface returned no exercises for this training block.
      </p>
    </section>
  )
}

function WorkoutExecutor() {
  const [preferences, setPreferences] = useState(defaultPreferences)
  const [activeMenu, setActiveMenu] = useState(null)
  const [sessionVersion, setSessionVersion] = useState(0)
  const [sessionBundle, setSessionBundle] = useState(() =>
    generateWorkout(fullActionLibrary, defaultPreferences, reservedFilters),
  )
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [currentSetIndex, setCurrentSetIndex] = useState(0)
  const [regressedExerciseIds, setRegressedExerciseIds] = useState([])
  const [workTimerState, setWorkTimerState] = useState(emptyWorkTimerState)
  const [restState, setRestState] = useState(emptyRestState)

  const plan = sessionBundle.plan
  const hasExercises = plan.length > 0
  const isSessionComplete = hasExercises && currentExerciseIndex >= plan.length
  const currentExercise = !isSessionComplete && hasExercises ? plan[currentExerciseIndex] : null
  const currentExerciseDuration = getExerciseDurationSeconds(currentExercise)
  const isCurrentExerciseTimed = Boolean(currentExerciseDuration)
  const isResting = restState.isRunning
  const isWorkTimerRunning = workTimerState.isRunning
  const sessionPhases = [...new Set(plan.map((exercise) => exercise.phase))]
  const activePhase = isSessionComplete
    ? sessionPhases[sessionPhases.length - 1]
    : currentExercise?.phase
  const currentPhaseIndex = activePhase ? sessionPhases.indexOf(activePhase) : -1
  const progressWidth = !hasExercises
    ? 0
    : isSessionComplete
      ? 100
      : ((currentPhaseIndex + 1) / sessionPhases.length) * 100
  const regressedCount =
    plan.filter((exercise) => exercise.autoRegressed).length + regressedExerciseIds.length
  const surfaceMode = isSessionComplete
    ? 'complete'
    : isResting
      ? 'rest'
      : isWorkTimerRunning
        ? 'timer'
        : 'work'

  const resetWorkTimer = () => {
    setWorkTimerState((current) => ({
      ...emptyWorkTimerState,
      runId: current.runId,
    }))
  }

  const resetRestState = () => {
    setRestState((current) => ({
      ...emptyRestState,
      runId: current.runId,
    }))
  }

  const finalizeRestAction = (action) => {
    resetRestState()

    if (!action) {
      return
    }

    if (action.type === 'advance-exercise') {
      setCurrentExerciseIndex(action.exerciseIndex)
      setCurrentSetIndex(0)
      return
    }

    if (action.type === 'complete-session') {
      setCurrentExerciseIndex(plan.length)
      setCurrentSetIndex(0)
    }
  }

  const beginRest = (durationSeconds, restType, action) => {
    const normalizedDuration = Math.max(0, Number(durationSeconds) || 0)

    if (normalizedDuration <= 0) {
      finalizeRestAction(action)
      return
    }

    setRestState((current) => ({
      isRunning: true,
      remainingSeconds: normalizedDuration,
      totalSeconds: normalizedDuration,
      restType,
      action,
      runId: current.runId + 1,
    }))
  }

  const regeneratePlan = (nextPreferences = preferences) => {
    setPreferences(nextPreferences)
    setSessionBundle(generateWorkout(fullActionLibrary, nextPreferences, reservedFilters))
    setSessionVersion((current) => current + 1)
    setCurrentExerciseIndex(0)
    setCurrentSetIndex(0)
    setRegressedExerciseIds([])
    setActiveMenu(null)
    resetWorkTimer()
    resetRestState()
  }

  const resolveCompletedSet = () => {
    if (!currentExercise) {
      return
    }

    setActiveMenu(null)
    resetWorkTimer()

    const nextCompletedSetCount = Math.min(currentExercise.sets, currentSetIndex + 1)
    setCurrentSetIndex(nextCompletedSetCount)

    if (nextCompletedSetCount < currentExercise.sets) {
      beginRest(
        getRestDurationSeconds(currentExercise, 'intra'),
        'intra',
        { type: 'resume-set' },
      )
      return
    }

    if (currentExerciseIndex < plan.length - 1) {
      beginRest(
        getRestDurationSeconds(currentExercise, 'inter'),
        'inter',
        { type: 'advance-exercise', exerciseIndex: currentExerciseIndex + 1 },
      )
      return
    }

    beginRest(
      getRestDurationSeconds(currentExercise, 'inter'),
      'inter',
      { type: 'complete-session' },
    )
  }

  useEffect(() => {
    if (!isWorkTimerRunning) {
      return undefined
    }

    if (workTimerState.remainingSeconds <= 0) {
      resolveCompletedSet()
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setWorkTimerState((current) => ({
        ...current,
        remainingSeconds: current.remainingSeconds - 1,
      }))
    }, 1000)

    return () => window.clearTimeout(timeoutId)
  }, [isWorkTimerRunning, workTimerState.remainingSeconds, currentExerciseIndex, currentSetIndex])

  useEffect(() => {
    if (!isResting) {
      return undefined
    }

    if (restState.remainingSeconds <= 0) {
      finalizeRestAction(restState.action)
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setRestState((current) => ({
        ...current,
        remainingSeconds: current.remainingSeconds - 1,
      }))
    }, 1000)

    return () => window.clearTimeout(timeoutId)
  }, [isResting, restState.remainingSeconds])

  const handleSelectOption = (menuKey, value) => {
    regeneratePlan({ ...preferences, [menuKey]: value })
  }

  const handleRegression = () => {
    if (!currentExercise || regressedExerciseIds.includes(currentExercise.id)) {
      return
    }

    setActiveMenu(null)
    setRegressedExerciseIds((current) => [...current, currentExercise.id])
  }

  const handleCheck = () => {
    if (!currentExercise || isWorkTimerRunning || isResting) {
      return
    }

    setActiveMenu(null)

    if (isCurrentExerciseTimed && currentExerciseDuration) {
      setWorkTimerState((current) => ({
        isRunning: true,
        remainingSeconds: currentExerciseDuration,
        totalSeconds: currentExerciseDuration,
        runId: current.runId + 1,
      }))
      return
    }

    resolveCompletedSet()
  }

  const handleSkipRest = () => {
    if (!restState.isRunning) {
      return
    }

    finalizeRestAction(restState.action)
  }

  const bottomButtonLabel = isWorkTimerRunning
    ? formatTimerValue(workTimerState.remainingSeconds)
    : isCurrentExerciseTimed
      ? 'START TIMER'
      : 'CHECK'
  const exercisePanelKey = currentExercise
    ? `${sessionVersion}-${currentExercise.id}-${currentSetIndex}-${surfaceMode}-${workTimerState.runId}-${restState.runId}`
    : `empty-${sessionVersion}`

  return (
    <motion.main
      animate={{ backgroundColor: isResting ? '#F7FBFF' : '#FFFFFF' }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-[100dvh] text-[#1A1A1A]"
    >
      <div
        className="mx-auto flex min-h-[100dvh] w-full max-w-sm flex-col px-5 pb-36 pt-5"
        style={{
          paddingTop: `calc(env(safe-area-inset-top) + ${HOME_SHELL_TOP_OFFSET}px)`,
          paddingBottom: `calc(env(safe-area-inset-bottom) + ${HOME_SHELL_CONTENT_BOTTOM_OFFSET}px)`,
        }}
      >
        <header>
          <TopTagBar
            preferences={preferences}
            activeMenu={activeMenu}
            onToggleMenu={(menuKey) =>
              setActiveMenu((current) => (current === menuKey ? null : menuKey))
            }
            onSelectOption={handleSelectOption}
            onRefresh={() => regeneratePlan(preferences)}
          />

          <div className="mt-4 h-0.5 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
            <motion.div
              className="h-full rounded-full bg-[#22C55E]"
              animate={{ width: `${progressWidth}%` }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          <div className="mt-4 flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#94A3B8]">
                onlytry
              </p>
              <p className="mt-2 text-xl font-black tracking-[-0.03em] text-[#1A1A1A]">
                {!hasExercises
                  ? 'Waiting'
                  : isSessionComplete
                    ? 'Finished'
                    : currentExercise?.phase ?? 'Waiting'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#94A3B8]">
                {hasExercises
                  ? isSessionComplete
                    ? `${plan.length}/${plan.length}`
                    : `${currentExerciseIndex + 1}/${plan.length}`
                  : '0/0'}
              </p>
              {!isSessionComplete ? (
                <p
                  className={`mt-2 text-[11px] font-semibold uppercase tracking-[0.22em] ${
                    isResting ? 'text-[#60A5FA]' : isWorkTimerRunning ? 'text-[#22C55E]' : 'text-[#94A3B8]'
                  }`}
                >
                  {isResting ? 'Resting' : isWorkTimerRunning ? 'Working' : 'Ready'}
                </p>
              ) : null}
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col justify-center overflow-hidden py-6">
          <AnimatePresence mode="wait" initial={false}>
            {!hasExercises ? (
              <EmptyPanel key="empty-state" />
            ) : isSessionComplete ? (
              <CompletionPanel
                key={`session-complete-${sessionVersion}`}
                sessionBundle={sessionBundle}
                regressedCount={regressedCount}
              />
            ) : (
              <ExercisePanel
                key={exercisePanelKey}
                exercise={currentExercise}
                currentSetIndex={currentSetIndex}
                totalExercises={plan.length}
                currentExerciseIndex={currentExerciseIndex}
                isRegressed={regressedExerciseIds.includes(currentExercise.id)}
                onRegression={handleRegression}
                workTimerState={workTimerState}
                restState={restState}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      <motion.div
        animate={{ backgroundColor: isResting ? 'rgba(247, 251, 255, 0.96)' : 'rgba(255, 255, 255, 0.95)' }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none fixed inset-x-0 bottom-0 border-t border-[#E2E8F0] backdrop-blur-sm"
        style={{ bottom: `calc(env(safe-area-inset-bottom) + ${HOME_SHELL_BOTTOM_NAV_HEIGHT}px)` }}
      >
        <div
          className="pointer-events-auto mx-auto w-full max-w-sm px-5 pt-4"
          style={{ paddingBottom: '0.25rem' }}
        >
          {!hasExercises ? (
            <button
              type="button"
              disabled
              className="h-20 w-full rounded-[28px] bg-[#CBD5E1] text-xl font-black tracking-[0.22em] text-white"
            >
              NO PLAN
            </button>
          ) : isSessionComplete ? (
            <button
              type="button"
              onClick={() => regeneratePlan(preferences)}
              className="h-20 w-full rounded-[28px] bg-[#1A1A1A] text-lg font-black tracking-[0.18em] text-white transition hover:bg-[#111111]"
            >
              REFRESH
            </button>
          ) : isResting ? (
            <RestDial restState={restState} onSkip={handleSkipRest} />
          ) : (
            <button
              type="button"
              onClick={handleCheck}
              disabled={isWorkTimerRunning}
              className="h-20 w-full rounded-[28px] bg-[#1A1A1A] text-xl font-black tracking-[0.18em] text-white transition hover:bg-[#111111] disabled:cursor-default disabled:bg-[#22C55E]"
            >
              {bottomButtonLabel}
            </button>
          )}
        </div>
      </motion.div>
    </motion.main>
  )
}

export default WorkoutExecutor
