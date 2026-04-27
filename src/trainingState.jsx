import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  APP_MODES,
  DEFAULT_APP_MODE,
  DEFAULT_CURRENT_TSS,
  DEFAULT_EXTERNAL_LOGS,
  PRESCRIPTIONS,
  calculateTrainTSS,
  calculateFluidCalendar,
  calculatePlayTSS,
} from './trainingSystem'
import {
  addActivityLog,
  addHistoryLog,
  getAllLogs,
} from './trainingDb'

const TrainingStateContext = createContext(undefined)
const CURRENT_TSS_STORAGE_KEY = 'onlytry.currentTSS'

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

function getInitialCurrentTss() {
  if (typeof window === 'undefined') {
    return DEFAULT_CURRENT_TSS
  }

  const storedValue = window.localStorage.getItem(CURRENT_TSS_STORAGE_KEY)
  const numericValue = Number(storedValue)

  return Number.isFinite(numericValue) ? numericValue : DEFAULT_CURRENT_TSS
}

export function TrainingStateProvider({ children }) {
  const [currentTSS, setCurrentTSS] = useState(getInitialCurrentTss)
  const [activityLogs, setActivityLogs] = useState(() => [...DEFAULT_EXTERNAL_LOGS])
  const [historyLogs, setHistoryLogs] = useState([])
  const [logsVersion, setLogsVersion] = useState(0)
  const [appMode, setAppMode] = useState(DEFAULT_APP_MODE)

  const fluidCalendar = useMemo(() => calculateFluidCalendar(currentTSS), [currentTSS])

  useEffect(() => {
    let isActive = true

    const hydrateLogs = async () => {
      const { history, activityLogs: persistedActivityLogs } = await getAllLogs()

      if (!isActive) {
        return
      }

      setHistoryLogs(history)
      setActivityLogs(persistedActivityLogs)
      setLogsVersion((current) => current + 1)
    }

    hydrateLogs().catch(() => {
      if (!isActive) {
        return
      }

      setHistoryLogs([])
      setActivityLogs([...DEFAULT_EXTERNAL_LOGS])
    })

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(CURRENT_TSS_STORAGE_KEY, String(currentTSS))
  }, [currentTSS])

  const appendExternalLog = async (entry) => {
    const normalizedEntry = normalizeExternalLog(entry)
    const persistedEntry = await addActivityLog(normalizedEntry)

    setActivityLogs((current) => [...current, persistedEntry])
    setCurrentTSS((current) => Math.round((current + persistedEntry.tssEarned) * 10) / 10)
    setLogsVersion((current) => current + 1)

    return persistedEntry
  }

  const appendHistoryLog = async (entry) => {
    const normalizedEntry = {
      ...entry,
      tssEarned: Number.isFinite(Number(entry.tssEarned))
        ? Number(entry.tssEarned)
        : calculateTrainTSS(entry),
    }
    const persistedEntry = await addHistoryLog(normalizedEntry)

    setHistoryLogs((current) => [...current, persistedEntry])
    setCurrentTSS((current) => Math.round((current + persistedEntry.tssEarned) * 10) / 10)
    setLogsVersion((current) => current + 1)

    return persistedEntry
  }

  const resetTrainingState = () => {
    setCurrentTSS(DEFAULT_CURRENT_TSS)
    setAppMode(DEFAULT_APP_MODE)
  }

  const value = useMemo(
    () => ({
      appMode,
      setAppMode,
      currentTSS,
      setCurrentTSS,
      externalLogs: activityLogs,
      setExternalLogs: setActivityLogs,
      activityLogs,
      historyLogs,
      logsVersion,
      fluidCalendar,
      trainingPrescriptions: PRESCRIPTIONS,
      appendExternalLog,
      appendHistoryLog,
      resetTrainingState,
    }),
    [activityLogs, appMode, currentTSS, fluidCalendar, historyLogs, logsVersion],
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
