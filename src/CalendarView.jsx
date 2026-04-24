import { CalendarDays, Flame } from 'lucide-react'
import { useTrainingState } from './trainingState'

const HOME_SHELL_TOP_OFFSET = 92
const HOME_SHELL_BOTTOM_NAV_HEIGHT = 86
const CALENDAR_CONTENT_BOTTOM_OFFSET = 112

const dayLabels = ['Tomorrow', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7']

function CalendarView() {
  const { currentTSS, fluidCalendar, externalLogs } = useTrainingState()

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
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#94A3B8]">
            Calendar
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.06em] text-[#1A1A1A]">
            Dynamic Week
          </h1>
          <p className="mt-4 max-w-[15rem] text-sm leading-6 text-[#64748B]">
            根据当前训练负荷，系统给你滚动生成未来 7 天的动作方向。
          </p>
        </header>

        <section className="grid grid-cols-2 gap-4 pt-10">
          <div className="rounded-[26px] bg-[#F8FAFC] p-5">
            <div className="flex items-center gap-2 text-[#94A3B8]">
              <Flame className="h-4 w-4" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em]">Current TSS</p>
            </div>
            <p className="mt-4 text-4xl font-black tracking-[-0.05em] text-[#1A1A1A]">
              {currentTSS}
            </p>
          </div>

          <div className="rounded-[26px] bg-[#F8FAFC] p-5">
            <div className="flex items-center gap-2 text-[#94A3B8]">
              <CalendarDays className="h-4 w-4" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em]">Play Logs</p>
            </div>
            <p className="mt-4 text-4xl font-black tracking-[-0.05em] text-[#1A1A1A]">
              {externalLogs.length}
            </p>
          </div>
        </section>

        <section className="pt-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#94A3B8]">
            Next 7 Prescriptions
          </p>
          <div className="mt-4">
            {fluidCalendar.map((item, index) => (
              <div
                key={`${dayLabels[index]}-${item}`}
                className="flex items-start justify-between gap-4 border-b border-[#E2E8F0] py-5 last:border-b-0"
              >
                <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.22em] text-[#94A3B8]">
                  {dayLabels[index]}
                </p>
                <p className="text-right text-lg font-black leading-tight tracking-[-0.03em] text-[#1A1A1A]">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </section>

        {externalLogs.length > 0 ? (
          <section className="pt-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#94A3B8]">
              Recent Play Logs
            </p>
            <div className="mt-4">
              {externalLogs
                .slice(-3)
                .reverse()
                .map((entry) => (
                  <div
                    key={`${entry.date}-${entry.sportType}-${entry.duration}`}
                    className="flex items-start justify-between gap-4 border-b border-[#E2E8F0] py-4 last:border-b-0"
                  >
                    <div>
                      <p className="text-base font-black tracking-[-0.03em] text-[#1A1A1A]">
                        {entry.sportType}
                      </p>
                      <p className="mt-1 text-sm text-[#64748B]">
                        {entry.duration} min · RPE {entry.rpe}
                      </p>
                    </div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
                      +{entry.tssEarned}
                    </p>
                  </div>
                ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  )
}

export default CalendarView
