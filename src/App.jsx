import { useState } from 'react'
import { ArrowDown, CheckCircle2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

const phaseOrder = ['Warm-up', 'Power', 'Strength', 'Core', 'ESD']

const sessionData = [
  { id: 'w1', phase: 'Warm-up', name: '翻书 (Open Book)', reg: '仰卧转体', instruct: '胸椎转动，感受胸前拉伸', sets: 2, reps: '10次/边' },
  { id: 'p1', phase: 'Power', name: '药球侧抛', reg: '跪姿侧抛', instruct: '核心收紧，瞬间爆发投掷', sets: 3, reps: '6次/边' },
  { id: 's1', phase: 'Strength', name: '单腿硬拉', reg: '支撑腿硬拉', instruct: '髋关节后移，保持背部平直', sets: 3, weight: '12kg', reps: '8次/边' },
  { id: 'c1', phase: 'Core', name: '死虫抗阻', reg: '基础死虫', instruct: '腰椎压紧地面，对侧伸展', sets: 3, reps: '30秒' },
]

const reservedFilters = {
  phase: null,
  pattern: null,
  plane: null,
  isNew: null,
}

function applySessionFilters(actions, filters = {}) {
  return actions.filter((action) =>
    Object.entries(filters).every(([key, value]) => {
      if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) {
        return true
      }

      if (Array.isArray(value)) {
        return value.includes(action[key])
      }

      return action[key] === value
    }),
  )
}

function sortSession(actions) {
  return [...actions].sort((left, right) => {
    const leftPhaseIndex = phaseOrder.indexOf(left.phase)
    const rightPhaseIndex = phaseOrder.indexOf(right.phase)

    return leftPhaseIndex - rightPhaseIndex
  })
}

function buildPrimaryMetric(exercise) {
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

function IllustrationPlaceholder() {
  return (
    <div
      id="video-container"
      className="relative flex min-h-[220px] items-center justify-center overflow-hidden rounded-[30px] border border-dashed border-[#E2E8F0] bg-[#F8FAFC]"
    >
      <div className="absolute inset-x-8 bottom-7 h-px bg-[#E2E8F0]" />
      <div className="relative h-36 w-40">
        <div className="absolute left-1/2 top-0 h-10 w-10 -translate-x-1/2 rounded-full border-2 border-[#CBD5E1] bg-white" />
        <div className="absolute left-1/2 top-10 h-12 w-[2px] -translate-x-1/2 bg-[#94A3B8]" />
        <div className="absolute left-[48%] top-[3.1rem] h-[2px] w-14 -translate-x-full -rotate-[22deg] bg-[#94A3B8]" />
        <div className="absolute left-[52%] top-[3.1rem] h-[2px] w-14 rotate-[26deg] bg-[#22C55E]" />
        <div className="absolute left-[49%] top-[5.6rem] h-14 w-[2px] -translate-x-1/2 -rotate-[18deg] bg-[#94A3B8]" />
        <div className="absolute left-[51%] top-[5.2rem] h-16 w-[2px] -translate-x-1/2 rotate-[28deg] bg-[#22C55E]" />
        <div className="absolute right-2 top-10 h-12 w-12 rounded-full border border-[#DCFCE7] bg-[#F0FDF4]" />
        <div className="absolute right-5 top-[3.8rem] h-2 w-2 rounded-full bg-[#22C55E]" />
      </div>
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
}) {
  const primaryMetric = buildPrimaryMetric(exercise)

  return (
    <motion.section
      key={exercise.id}
      initial={{ x: 56, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -56, opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-1 flex-col"
    >
      <IllustrationPlaceholder />

      <div className="mt-8 text-center">
        <div className="flex items-start justify-center gap-2">
          <h1 className="max-w-[15rem] text-3xl font-black leading-tight tracking-[-0.04em] text-[#1A1A1A]">
            {isRegressed ? exercise.reg : exercise.name}
          </h1>
          <button
            type="button"
            onClick={onRegression}
            disabled={isRegressed}
            aria-label={isRegressed ? 'Regression active' : 'Switch to regression'}
            className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#94A3B8] transition hover:bg-[#F8FAFC] hover:text-[#64748B] disabled:cursor-default disabled:text-[#22C55E]"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        </div>

        <p className="mx-auto mt-3 max-w-[15rem] text-sm leading-6 text-[#64748B]">
          {isRegressed
            ? `已切换为降阶动作，当前保持：${exercise.reg}`
            : exercise.instruct}
        </p>
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
          Sets completed {currentSetIndex} / {exercise.sets}
        </p>
      </div>
    </motion.section>
  )
}

function CompletionPanel({ totalExercises, regressedCount }) {
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
        {totalExercises} movements finished. Regression used on {regressedCount} exercise
        {regressedCount === 1 ? '' : 's'}.
      </p>
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

function App() {
  const filteredSession = sortSession(applySessionFilters(sessionData, reservedFilters))
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [currentSetIndex, setCurrentSetIndex] = useState(0)
  const [regressedExerciseIds, setRegressedExerciseIds] = useState([])

  const hasExercises = filteredSession.length > 0
  const isSessionComplete = hasExercises && currentExerciseIndex >= filteredSession.length
  const currentExercise = !isSessionComplete && hasExercises
    ? filteredSession[currentExerciseIndex]
    : null
  const sessionPhases = [...new Set(filteredSession.map((exercise) => exercise.phase))]
  const activePhase = isSessionComplete
    ? sessionPhases[sessionPhases.length - 1]
    : currentExercise?.phase
  const currentPhaseIndex = activePhase ? sessionPhases.indexOf(activePhase) : -1
  const progressWidth = !hasExercises
    ? 0
    : isSessionComplete
      ? 100
      : ((currentPhaseIndex + 1) / sessionPhases.length) * 100

  const handleRegression = () => {
    if (!currentExercise || regressedExerciseIds.includes(currentExercise.id)) {
      return
    }

    setRegressedExerciseIds((current) => [...current, currentExercise.id])
  }

  const handleCheck = () => {
    if (!currentExercise) {
      return
    }

    const nextCompletedSetCount = currentSetIndex + 1

    if (nextCompletedSetCount < currentExercise.sets) {
      setCurrentSetIndex(nextCompletedSetCount)
      return
    }

    if (currentExerciseIndex < filteredSession.length - 1) {
      setCurrentExerciseIndex((current) => current + 1)
      setCurrentSetIndex(0)
      return
    }

    setCurrentExerciseIndex(filteredSession.length)
    setCurrentSetIndex(0)
  }

  return (
    <main className="min-h-[100dvh] bg-[#FFFFFF] text-[#1A1A1A]">
      <div
        className="mx-auto flex min-h-[100dvh] w-full max-w-sm flex-col px-5 pb-36 pt-5"
        style={{
          paddingTop: 'max(1.25rem, env(safe-area-inset-top))',
          paddingBottom: 'max(9rem, calc(8rem + env(safe-area-inset-bottom)))',
        }}
      >
        <header>
          <div className="h-0.5 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
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
                {isSessionComplete ? 'Finished' : currentExercise?.phase ?? 'Waiting'}
              </p>
            </div>
            <p className="text-right text-xs font-semibold uppercase tracking-[0.22em] text-[#94A3B8]">
              {hasExercises
                ? isSessionComplete
                  ? `${filteredSession.length}/${filteredSession.length}`
                  : `${currentExerciseIndex + 1}/${filteredSession.length}`
                : '0/0'}
            </p>
          </div>
        </header>

        <div className="flex flex-1 flex-col justify-center overflow-hidden py-6">
          <AnimatePresence mode="wait" initial={false}>
            {!hasExercises ? (
              <EmptyPanel key="empty-state" />
            ) : isSessionComplete ? (
              <CompletionPanel
                key="session-complete"
                totalExercises={filteredSession.length}
                regressedCount={regressedExerciseIds.length}
              />
            ) : (
              <ExercisePanel
                key={currentExercise.id}
                exercise={currentExercise}
                currentSetIndex={currentSetIndex}
                totalExercises={filteredSession.length}
                currentExerciseIndex={currentExerciseIndex}
                isRegressed={regressedExerciseIds.includes(currentExercise.id)}
                onRegression={handleRegression}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 border-t border-[#E2E8F0] bg-white/95 backdrop-blur-sm">
        <div
          className="pointer-events-auto mx-auto w-full max-w-sm px-5 pt-4"
          style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
        >
          <button
            type="button"
            onClick={handleCheck}
            disabled={!hasExercises || isSessionComplete}
            className="h-20 w-full rounded-[28px] bg-[#1A1A1A] text-xl font-black tracking-[0.22em] text-white transition hover:bg-[#111111] disabled:cursor-not-allowed disabled:bg-[#CBD5E1]"
          >
            CHECK
          </button>
        </div>
      </div>
    </main>
  )
}

export default App
