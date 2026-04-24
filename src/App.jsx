import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, House } from 'lucide-react'
import CalendarView from './CalendarView'
import PlayLogger from './PlayLogger'
import { useTrainingState } from './trainingState'
import { APP_MODES } from './trainingSystem'
import WorkoutExecutor from './WorkoutExecutor'

const HOME_TABS = {
  HOME: 'HOME',
  CALENDAR: 'CALENDAR',
}

const shellTabs = [
  { key: HOME_TABS.HOME, label: 'Home', icon: House },
  { key: HOME_TABS.CALENDAR, label: 'Calendar', icon: CalendarDays },
]

function ModeSwitch() {
  const { appMode, setAppMode } = useTrainingState()

  return (
    <div className="fixed inset-x-0 top-0 z-40 flex justify-center px-5">
      <div
        className="w-full max-w-sm pt-4"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
      >
        <div className="mx-auto flex w-full max-w-[12rem] rounded-full border border-[#E2E8F0] bg-white/92 p-1 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          {[APP_MODES.TRAIN, APP_MODES.PLAY].map((mode) => {
            const isActive = appMode === mode

            return (
              <button
                key={mode}
                type="button"
                onClick={() => setAppMode(mode)}
                className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold tracking-[-0.01em] transition ${
                  isActive
                    ? 'bg-[#1A1A1A] text-white'
                    : 'text-[#64748B]'
                }`}
              >
                {mode === APP_MODES.TRAIN ? 'Train' : 'Play'}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function GlobalTabNavigation({ currentTab, onSelectTab }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40">
      <div
        className="pointer-events-auto mx-auto w-full max-w-sm px-5"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <div className="grid grid-cols-2 rounded-[28px] border border-[#E2E8F0] bg-white/95 p-2 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-sm">
          {shellTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = currentTab === tab.key

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onSelectTab(tab.key)}
                className={`flex items-center justify-center gap-2 rounded-[20px] px-4 py-3 text-sm font-semibold tracking-[-0.01em] transition ${
                  isActive
                    ? 'bg-[#1A1A1A] text-white'
                    : 'text-[#64748B]'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function App() {
  const { appMode } = useTrainingState()
  const [currentTab, setCurrentTab] = useState(HOME_TABS.HOME)

  const activeScreen =
    currentTab === HOME_TABS.CALENDAR
      ? <CalendarView />
      : appMode === APP_MODES.TRAIN
        ? <WorkoutExecutor />
        : <PlayLogger />

  return (
    <>
      <ModeSwitch />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${currentTab}-${appMode}`}
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -18 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          {activeScreen}
        </motion.div>
      </AnimatePresence>

      <GlobalTabNavigation currentTab={currentTab} onSelectTab={setCurrentTab} />
    </>
  )
}

export default App
