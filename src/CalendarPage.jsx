import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { useTrainingState } from './trainingState'
import { calculateFluidCalendar } from './trainingSystem'

const HOME_SHELL_TOP_OFFSET = 92
const CALENDAR_CONTENT_BOTTOM_OFFSET = 112
const RECOVERY_PRESCRIPTION = '无痛重启 (Recovery)'
const FALLBACK_STABILITY_PRESCRIPTION = '足踝稳定/肩胸功能'

const monthDayFormatter = new Intl.DateTimeFormat('zh-CN', {
  month: '2-digit',
  day: '2-digit',
})

const weekdayFormatter = new Intl.DateTimeFormat('zh-CN', {
  weekday: 'short',
})

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

function addDays(date, daysToAdd) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + daysToAdd)
  return nextDate
}

function formatMonthDay(date) {
  return monthDayFormatter.format(date).replace(/\//g, '.')
}

function buildTimelineEntries(currentTss, externalLogs) {
  const today = new Date()
  const basePlan = calculateFluidCalendar(currentTss)
  const latestTodayLog =
    [...externalLogs].reverse().find((entry) => {
      const entryDate = new Date(entry.date)
      return !Number.isNaN(entryDate.getTime()) && isSameLocalDay(entryDate, today)
    }) ?? null

  return Array.from({ length: 7 }, (_, index) => {
    const calendarDate = addDays(today, index)
    const sharedEntry = {
      id: `${calendarDate.toISOString()}-${index}`,
      dayLabel: `Day ${index + 1}`,
      relativeLabel: index === 0 ? 'Today' : `Day ${index + 1}`,
      dateLabel: formatMonthDay(calendarDate),
      weekdayLabel: weekdayFormatter.format(calendarDate),
      isToday: index === 0,
      isLogged: false,
      isShifted: false,
      prescription:
        basePlan[index] ?? basePlan[basePlan.length - 1] ?? FALLBACK_STABILITY_PRESCRIPTION,
      note: index === 0 ? '当前系统建议会直接落在今天。' : '',
    }

    if (!latestTodayLog) {
      return sharedEntry
    }

    if (index === 0) {
      return {
        ...sharedEntry,
        isLogged: true,
        prescription: `已记录: ${latestTodayLog.sportType} (+${formatTssValue(latestTodayLog.tssEarned)} TSS)`,
        note: '今日系统外运动已写入负荷，明天会自动切向恢复。',
      }
    }

    if (index === 1) {
      return {
        ...sharedEntry,
        isShifted: true,
        prescription: RECOVERY_PRESCRIPTION,
        note: '由于今天已经有额外负荷，明日编排自动降到恢复日。',
      }
    }

    return {
      ...sharedEntry,
      isShifted: true,
      prescription:
        basePlan[index - 1] ?? basePlan[basePlan.length - 1] ?? FALLBACK_STABILITY_PRESCRIPTION,
      note:
        index === 2
          ? '后续处方已经根据新的系统负荷重新后移。'
          : '',
    }
  })
}

function CalendarPage() {
  const { currentTSS, externalLogs } = useTrainingState()

  const timelineEntries = useMemo(
    () => buildTimelineEntries(currentTSS, externalLogs),
    [currentTSS, externalLogs],
  )

  const tssTone = getTssTone(currentTSS)
  const progressPercentage = clamp(Number(currentTSS) || 0, 0, 100)
  const latestTodayEntry = timelineEntries[0]

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

            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#94A3B8]">
              {tssTone.label}
            </p>
          </div>
        </header>

        <section className="pt-14">
          <div className="flex items-end justify-between gap-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#94A3B8]">
              Timeline
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#94A3B8]">
              7 Days
            </p>
          </div>

          {latestTodayEntry.isLogged ? (
            <p className="mt-4 max-w-[16rem] text-sm leading-6 text-[#64748B]">
              今天已经记录了系统外运动，后面的训练日程会更偏向恢复和稳定。
            </p>
          ) : null}

          <div className="mt-6">
            {timelineEntries.map((entry, index) => {
              const titleClasses = entry.isToday
                ? 'text-[1.9rem] leading-[1.05] tracking-[-0.06em]'
                : 'text-[1.35rem] leading-[1.08] tracking-[-0.04em]'

              const prescriptionColor = entry.isLogged
                ? '#1A1A1A'
                : entry.prescription === RECOVERY_PRESCRIPTION
                  ? '#15803D'
                  : '#1A1A1A'

              return (
                <article
                  key={entry.id}
                  className={`border-b border-[#E2E8F0] ${
                    index === 0 ? 'py-8' : 'py-6'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-[5.25rem] shrink-0">
                      <p
                        className={`text-[10px] font-semibold uppercase tracking-[0.24em] ${
                          entry.isToday ? 'text-[#1A1A1A]' : 'text-[#94A3B8]'
                        }`}
                      >
                        {entry.dayLabel}
                      </p>
                      <p
                        className={`mt-2 font-black tracking-[-0.04em] ${
                          entry.isToday ? 'text-lg text-[#1A1A1A]' : 'text-sm text-[#64748B]'
                        }`}
                      >
                        {entry.relativeLabel}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[#64748B]">
                        {entry.dateLabel}
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
                        {entry.weekdayLabel}
                      </p>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p
                            className={`font-black ${titleClasses}`}
                            style={{ color: prescriptionColor }}
                          >
                            {entry.prescription}
                          </p>

                          {entry.note ? (
                            <p className="mt-3 max-w-[15rem] text-sm leading-6 text-[#64748B]">
                              {entry.note}
                            </p>
                          ) : null}
                        </div>

                        {entry.isLogged ? (
                          <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#22C55E]" />
                        ) : null}
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}

export default CalendarPage
