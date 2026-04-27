import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { useTrainingState } from './trainingState'
import { calculatePlayTSS } from './trainingSystem'

const sportOptions = [
  { value: '篮球', label: '🏀篮球' },
  { value: '网球', label: '🎾网球' },
  { value: '跑步', label: '🏃跑步' },
  { value: '攀岩', label: '🧗攀岩' },
]

const HOME_SHELL_TOP_OFFSET = 92
const HOME_SHELL_BOTTOM_NAV_HEIGHT = 86
const PLAY_LOGGER_CONTENT_BOTTOM_OFFSET = 214

function SuccessToast({ message }) {
  return (
    <motion.div
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -12, opacity: 0 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-5"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 5.9rem)' }}
    >
      <div className="flex items-center gap-3 rounded-full bg-[#1A1A1A] px-4 py-3 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
        <CheckCircle2 className="h-4 w-4" />
        <p className="text-sm font-semibold tracking-[-0.01em]">{message}</p>
      </div>
    </motion.div>
  )
}

function SliderSection({ label, value, unit, min, max, step, onChange }) {
  return (
    <section className="pt-10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#94A3B8]">
        {label}
      </p>
      <p className="mt-4 text-6xl font-black tracking-[-0.06em] text-[#1A1A1A]">
        {value}
        <span className="ml-2 text-2xl font-bold tracking-[-0.03em] text-[#94A3B8]">{unit}</span>
      </p>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-6 h-2 w-full cursor-pointer appearance-none rounded-full bg-[#E2E8F0] accent-[#1A1A1A]"
      />
      <div className="mt-3 flex justify-between text-xs font-semibold uppercase tracking-[0.2em] text-[#94A3B8]">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </section>
  )
}

function PlayLogger() {
  const { appendExternalLog, currentTSS } = useTrainingState()
  const [selectedSport, setSelectedSport] = useState(sportOptions[0].value)
  const [duration, setDuration] = useState(60)
  const [rpe, setRpe] = useState(5)
  const [toastMessage, setToastMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const estimatedTss = calculatePlayTSS(duration, rpe)

  useEffect(() => {
    if (!toastMessage) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setToastMessage('')
    }, 2200)

    return () => window.clearTimeout(timeoutId)
  }, [toastMessage])

  const handleLogActivity = async () => {
    if (isSaving) {
      return
    }

    const tssEarned = calculatePlayTSS(duration, rpe)

    setIsSaving(true)

    try {
      await appendExternalLog({
        date: new Date().toISOString(),
        sportType: selectedSport,
        duration,
        rpe,
        tssEarned,
      })

      setToastMessage(`已记录 ${selectedSport} · +${tssEarned} TSS`)
      setSelectedSport(sportOptions[0].value)
      setDuration(60)
      setRpe(5)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <AnimatePresence>{toastMessage ? <SuccessToast message={toastMessage} /> : null}</AnimatePresence>

      <main className="min-h-[100dvh] bg-[#FFFFFF] text-[#1A1A1A]">
        <div
          className="mx-auto flex min-h-[100dvh] w-full max-w-sm flex-col px-5"
          style={{
            paddingTop: `calc(env(safe-area-inset-top) + ${HOME_SHELL_TOP_OFFSET}px)`,
            paddingBottom: `calc(env(safe-area-inset-bottom) + ${PLAY_LOGGER_CONTENT_BOTTOM_OFFSET}px)`,
          }}
        >
          <header>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#94A3B8]">
              Play
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.06em] text-[#1A1A1A]">
              系统外运动
            </h1>
            <p className="mt-4 max-w-[15rem] text-sm leading-6 text-[#64748B]">
              把你在场上、路上、岩壁上的额外负荷记进系统里。
            </p>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-[#94A3B8]">
              Current TSS {currentTSS}
            </p>
          </header>

          <section className="pt-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#94A3B8]">
              运动类型 Sport Type
            </p>
            <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
              {sportOptions.map((option) => {
                const isActive = option.value === selectedSport

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedSport(option.value)}
                    className={`shrink-0 rounded-full px-4 py-3 text-base font-bold tracking-[-0.02em] transition ${
                      isActive
                        ? 'bg-[#1A1A1A] text-white'
                        : 'bg-[#F8FAFC] text-[#1A1A1A]'
                    }`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </section>

          <SliderSection
            label="时长 Duration"
            value={duration}
            unit="min"
            min={10}
            max={180}
            step={5}
            onChange={setDuration}
          />

          <SliderSection
            label="激烈程度 Intensity"
            value={rpe}
            unit="RPE"
            min={1}
            max={10}
            step={1}
            onChange={setRpe}
          />

          <section className="flex flex-1 items-end pb-2 pt-10">
            <p className="text-sm font-semibold tracking-[-0.01em] text-[#94A3B8]">
              Estimated load +{estimatedTss} TSS
            </p>
          </section>
        </div>

        <div
          className="pointer-events-none fixed inset-x-0 bottom-0"
          style={{ bottom: `calc(env(safe-area-inset-bottom) + ${HOME_SHELL_BOTTOM_NAV_HEIGHT}px)` }}
        >
          <div className="pointer-events-auto mx-auto w-full max-w-sm px-5 pb-1 pt-4">
            <button
              type="button"
              onClick={handleLogActivity}
              disabled={isSaving}
              className="h-20 w-full rounded-[28px] bg-[#1A1A1A] text-lg font-black tracking-[0.14em] text-white transition hover:bg-[#111111]"
            >
              {isSaving ? 'SAVING' : '记录系统外运动 (LOG ACTIVITY)'}
            </button>
          </div>
        </div>
      </main>
    </>
  )
}

export default PlayLogger
