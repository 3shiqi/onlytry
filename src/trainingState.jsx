import { createContext, useContext, useMemo, useState } from 'react'
import {
  APP_MODES,
  DEFAULT_APP_MODE,
  DEFAULT_CURRENT_TSS,
  DEFAULT_EXTERNAL_LOGS,
  PRESCRIPTIONS,
  calculateFluidCalendar,
  calculatePlayTSS,
} from './trainingSystem'

const TrainingStateContext = createContext(undefined)

function normalizeExternalLog(entry) {
  const duration = Number(entry.duration) || 0
  const rpe = Number(entry.rpe) || 0
  const providedTssEarned = Number(entry.tssEarned)
  const tssEarned = Number.isFinite(providedTssEarned)
    ? providedTssEarned
    : calculatePlayTSS(duration, rpe)

  return {
    date: entry.date ?? '',
    sportType: entry.sportType ?? '',
    duration,
    rpe,
    tssEarned,
  }
}

export function TrainingStateProvider({ children }) {
  const [currentTSS, setCurrentTSS] = useState(DEFAULT_CURRENT_TSS)
  const [externalLogs, setExternalLogs] = useState(() => [...DEFAULT_EXTERNAL_LOGS])
  const [appMode, setAppMode] = useState(DEFAULT_APP_MODE)

  const fluidCalendar = useMemo(() => calculateFluidCalendar(currentTSS), [currentTSS])

  const appendExternalLog = (entry) => {
    const normalizedEntry = normalizeExternalLog(entry)

    setExternalLogs((current) => [...current, normalizedEntry])
    setCurrentTSS((current) => Math.round((current + normalizedEntry.tssEarned) * 10) / 10)

    return normalizedEntry
  }

  const resetTrainingState = () => {
    setCurrentTSS(DEFAULT_CURRENT_TSS)
    setExternalLogs([...DEFAULT_EXTERNAL_LOGS])
    setAppMode(DEFAULT_APP_MODE)
  }

  const value = useMemo(
    () => ({
      appMode,
      setAppMode,
      currentTSS,
      setCurrentTSS,
      externalLogs,
      setExternalLogs,
      fluidCalendar,
      trainingPrescriptions: PRESCRIPTIONS,
      appendExternalLog,
      resetTrainingState,
    }),
    [appMode, currentTSS, externalLogs, fluidCalendar],
  )

  return <TrainingStateContext.Provider value={value}>{children}</TrainingStateContext.Provider>
}

export function useTrainingState() {
  const context = useContext(TrainingStateContext)

  if (!context) {
    throw new Error('useTrainingState must be used inside a TrainingStateProvider')
  }

  return context
}
