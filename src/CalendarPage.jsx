import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useTrainingState } from './trainingState'
import {
  REST_DAY_LABEL,
  buildProjectedCalendarSlots,
} from './trainingSystem'
import { getMonthLogs, toDateKey } from './trainingDb'

const HOME_SHELL_TOP_OFFSET = 92
const CALENDAR_CONTENT_BOTTOM_OFFSET = 112
const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function formatTssValue(value) {
  const numericValue = Math.round(Number(value) * 10) / 10

  if (!Number.isFinite(numericValue)) {
    return '0'
  }

  return Number.isInteger(numericValue) ? String(numericValue) : numericValue.toFixed(1)
}

function getTssTone(currentTss) {
  if (currentTss > 70) {
    return {
      color: '#EF4444',
      label: 'High Load',
    }
  }

  if (currentTss >= 40) {
    return {
      color: '#EAB308',
      label: 'Managed Load',
    }
  }

  return {
    color: '#22C55E',
    label: 'Ready Load',
  }
}

function isSameLocalDay(leftDate, rightDate) {
  return (
    leftDate.getFullYear() === rightDate.getFullYear() &&
    leftDate.getMonth() === rightDate.getMonth() &&
    leftDate.getDate() === rightDate.getDate()
  )
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function getDaysBetween(leftDate, rightDate) {
  const leftDay = startOfDay(leftDate)
  const rightDay = startOfDay(rightDate)
  const millisecondsPerDay = 1000 * 60 * 60 * 24

  return Math.round((leftDay.getTime() - rightDay.getTime()) / millisecondsPerDay)
}

function formatMonthHeading(date) {
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`
}

function getDetailCopy(day) {
  if (!day || day.isFiller) {
    return 'Select a date.'
  }

  if (day.state === 'COMPLETED') {
    const label = day.type === 'PLAY' ? day.sportType : day.theme
    return `Completed: ${label} (+${formatTssValue(day.tssEarned)} TSS)`
  }

  if (day.state === 'PLANNED') {
    return `Planned: ${day.theme}`
  }

  return day.isPast
    ? 'No completed log. Marked as rest / missed.'
    : 'Planned: REST (休息)'
}

function buildLogLookup(entries) {
  return entries.reduce((lookup, entry) => {
    const bucket = lookup.get(entry.dateKey) ?? []
    bucket.push(entry)
    lookup.set(entry.dateKey, bucket)
    return lookup
  }, new Map())
}

function pickPrimaryEntry(trainEntries = [], playEntries = []) {
  const combinedEntries = [
    ...trainEntries.map((entry) => ({ ...entry, type: 'TRAIN' })),
    ...playEntries.map((entry) => ({ ...entry, type: 'PLAY' })),
  ].sort((leftEntry, rightEntry) => new Date(rightEntry.date).getTime() - new Date(leftEntry.date).getTime())

  return combinedEntries[0] ?? null
}

export async function generateMonthData(year, month, options = {}) {
  const {
    currentTSS,
    today = new Date(),
  } = options
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const monthLabel = formatMonthHeading(firstDayOfMonth)
  const leadingOffset = (firstDayOfMonth.getDay() + 6) % 7
  const trailingOffset = (7 - ((leadingOffset + lastDayOfMonth.getDate()) % 7 || 7)) % 7
  const paddedCells = []
  const todayKey = toDateKey(today)
  const { history, activityLogs } = await getMonthLogs(year, month)
  const trainLookup = buildLogLookup(history)
  const playLookup = buildLogLookup(activityLogs)
  const todayHasActualLog = Boolean(
    (trainLookup.get(todayKey)?.length ?? 0) > 0 || (playLookup.get(todayKey)?.length ?? 0) > 0,
  )
  const futureDaysInMonth = Math.max(0, getDaysBetween(lastDayOfMonth, today) + 1)
  const projectedThemes = buildProjectedCalendarSlots(
    currentTSS,
    Math.max(7, futureDaysInMonth + (todayHasActualLog ? 0 : 1)),
  )

  for (let index = 0; index < leadingOffset; index += 1) {
    paddedCells.push({
      id: `leading-${year}-${month}-${index}`,
      isFiller: true,
    })
  }

  for (let dayNumber = 1; dayNumber <= lastDayOfMonth.getDate(); dayNumber += 1) {
    const date = new Date(year, month, dayNumber)
    const dateKey = toDateKey(date)
    const isToday = isSameLocalDay(date, today)
    const isPast = getDaysBetween(date, today) < 0
    const trainEntries = trainLookup.get(dateKey) ?? []
    const playEntries = playLookup.get(dateKey) ?? []
    const primaryEntry = pickPrimaryEntry(trainEntries, playEntries)
    const totalDayTss = [...trainEntries, ...playEntries].reduce(
      (sum, entry) => sum + (Number(entry.tssEarned) || 0),
      0,
    )

    if (primaryEntry && (isPast || isToday)) {
      paddedCells.push({
        id: `${dateKey}-completed`,
        date,
        dateKey,
        dayNumber,
        monthLabel,
        isToday,
        isPast,
        isFiller: false,
        state: 'COMPLETED',
        type: primaryEntry.type,
        theme: primaryEntry.type === 'TRAIN' ? primaryEntry.theme : '',
        sportType: primaryEntry.type === 'PLAY' ? primaryEntry.sportType : '',
        tssEarned: totalDayTss || primaryEntry.tssEarned || 0,
      })
      continue
    }

    if (isPast) {
      paddedCells.push({
        id: `${dateKey}-missed`,
        date,
        dateKey,
        dayNumber,
        monthLabel,
        isToday,
        isPast,
        isFiller: false,
        state: 'MISSED_OR_REST',
        type: null,
        theme: '',
        sportType: '',
        tssEarned: 0,
      })
      continue
    }

    const offsetFromToday = getDaysBetween(date, today)
    const projectionIndex = todayHasActualLog
      ? Math.max(0, offsetFromToday - 1)
      : Math.max(0, offsetFromToday)
    const plannedTheme = projectedThemes[projectionIndex] ?? REST_DAY_LABEL
    const plannedState = plannedTheme === REST_DAY_LABEL ? 'REST_OR_EMPTY' : 'PLANNED'

    paddedCells.push({
      id: `${dateKey}-planned`,
      date,
      dateKey,
      dayNumber,
      monthLabel,
      isToday,
      isPast: false,
      isFiller: false,
      state: plannedState,
      type: null,
      theme: plannedTheme,
      sportType: '',
      tssEarned: 0,
    })
  }

  for (let index = 0; index < trailingOffset; index += 1) {
    paddedCells.push({
      id: `trailing-${year}-${month}-${index}`,
      isFiller: true,
    })
  }

  return paddedCells
}

function CalendarCellMarker({ day }) {
  if (day.state === 'COMPLETED' && day.type === 'TRAIN') {
    return <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#1A1A1A]" />
  }

  if (day.state === 'COMPLETED' && day.type === 'PLAY') {
    return <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#94A3B8]" />
  }

  if (day.state === 'PLANNED') {
    return <span className="mt-2 h-3 w-3 rounded-full border border-[#1A1A1A]" />
  }

  if (day.state === 'REST_OR_EMPTY' || day.state === 'MISSED_OR_REST') {
    return <span className="mt-2 h-3 w-3 opacity-0" aria-hidden="true" />
  }

  return null
}

function CalendarPage() {
  const { currentTSS, logsVersion } = useTrainingState()
  const [monthData, setMonthData] = useState([])
  const [selectedDateKey, setSelectedDateKey] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const viewDate = useMemo(() => new Date(), [])

  useEffect(() => {
    let isActive = true

    const loadMonthData = async () => {
      setIsLoading(true)

      const generatedMonthData = await generateMonthData(
        viewDate.getFullYear(),
        viewDate.getMonth(),
        { currentTSS, today: new Date() },
      )

      if (!isActive) {
        return
      }

      setMonthData(generatedMonthData)
      setSelectedDateKey((current) => {
        const firstSelectableDay =
          generatedMonthData.find((day) => day.isToday && !day.isFiller)?.dateKey
          ?? generatedMonthData.find((day) => !day.isFiller)?.dateKey
          ?? ''

        if (!current) {
          return firstSelectableDay
        }

        const stillExists = generatedMonthData.some((day) => day.dateKey === current)
        return stillExists ? current : firstSelectableDay
      })
      setIsLoading(false)
    }

    loadMonthData().catch(() => {
      if (!isActive) {
        return
      }

      setMonthData([])
      setIsLoading(false)
    })

    return () => {
      isActive = false
    }
  }, [currentTSS, logsVersion, viewDate])

  const tssTone = getTssTone(currentTSS)
  const progressPercentage = clamp(Number(currentTSS) || 0, 0, 100)
  const selectedDay = monthData.find((day) => day.dateKey === selectedDateKey) ?? null
  const monthLabel = formatMonthHeading(viewDate)

  return (
    <main className="min-h-[100dvh] bg-[#FFFFFF] text-[#1A1A1A]">
      <div
        className="mx-auto flex min-h-[100dvh] w-full max-w-sm flex-col px-5"
        style={{
          paddingTop: `calc(env(safe-area-inset-top) + ${HOME_SHELL_TOP_OFFSET}px)`,
          paddingBottom: `calc(env(safe-area-inset-bottom) + ${CALENDAR_CONTENT_BOTTOM_OFFSET}px)`,
        }}
      >
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#1A1A1A]">
            SYSTEM LOAD (系统负荷)
          </p>

          <div className="mt-8">
            <div className="h-[2px] w-full bg-[#E2E8F0]">
              <motion.div
                className="h-full"
                initial={false}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                style={{ backgroundColor: tssTone.color }}
              />
            </div>

            <p
              className="mt-4 text-sm font-semibold tracking-[-0.01em]"
              style={{ color: tssTone.color }}
            >
              Current TSS: {formatTssValue(currentTSS)} / 100
            </p>
          </div>
        </header>

        <section className="pt-14">
          <div className="flex items-end justify-between gap-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#94A3B8]">
              Monthly Grid
            </p>
            <p className="text-2xl font-black tracking-[-0.06em] text-[#1A1A1A]">
              {monthLabel}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-7 gap-y-3">
            {WEEKDAY_LABELS.map((label) => (
              <p
                key={label}
                className="text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-[#94A3B8]"
              >
                {label}
              </p>
            ))}

            {monthData.map((day) => {
              if (day.isFiller) {
                return <div key={day.id} className="h-[4.8rem]" aria-hidden="true" />
              }

              const isSelected = day.dateKey === selectedDateKey
              const isRestLike =
                day.state === 'MISSED_OR_REST' ||
                day.state === 'REST_OR_EMPTY' ||
                day.theme === REST_DAY_LABEL

              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => setSelectedDateKey(day.dateKey)}
                  className="flex h-[4.8rem] flex-col items-center justify-start rounded-[18px] px-1 py-2 transition"
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center text-sm font-black tracking-[-0.03em] ${
                      isRestLike ? 'opacity-30' : ''
                    } ${
                      isSelected && !day.isToday
                        ? 'bg-[#F8FAFC] text-[#1A1A1A]'
                        : 'text-[#1A1A1A]'
                    } ${
                      day.isToday
                        ? 'rounded-full ring-2 ring-[#1A1A1A] ring-offset-2 ring-offset-[#FFFFFF]'
                        : 'rounded-full'
                    }`}
                  >
                    {day.dayNumber}
                  </span>
                  <CalendarCellMarker day={day} />
                </button>
              )
            })}
          </div>
        </section>

        <section className="pt-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#94A3B8]">
            Day Details
          </p>

          <div className="mt-5 min-h-[8rem]">
            {isLoading ? (
              <p className="text-sm leading-6 text-[#64748B]">Loading month...</p>
            ) : selectedDay ? (
              <>
                <p className="text-3xl font-black tracking-[-0.05em] text-[#1A1A1A]">
                  {selectedDay.monthLabel}.{String(selectedDay.dayNumber).padStart(2, '0')}
                </p>
                <p className="mt-4 max-w-[16rem] text-base leading-7 text-[#1A1A1A]">
                  {getDetailCopy(selectedDay)}
                </p>
              </>
            ) : (
              <p className="text-sm leading-6 text-[#64748B]">No date selected.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default CalendarPage
