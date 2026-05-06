import SwiftData
import SwiftUI

struct TrainingCalendarView: View {
    @Query(sort: \SessionLog.date, order: .reverse) private var logs: [SessionLog]

    var body: some View {
        NavigationStack {
            List {
                Section("This Month") {
                    MonthGridView(logs: logs)
                        .listRowSeparator(.hidden)
                }

                Section("History") {
                    if logs.isEmpty {
                        ContentUnavailableView(
                            "No Sessions Yet",
                            systemImage: "calendar",
                            description: Text("Completed sessions will appear here.")
                        )
                    } else {
                        ForEach(logs) { log in
                            VStack(alignment: .leading, spacing: 6) {
                                Text(log.theme)
                                    .font(.headline)
                                Text(log.date.formatted(date: .abbreviated, time: .omitted))
                                    .foregroundStyle(.secondary)
                                Text("\(log.exerciseNames.count) exercises • \(log.completedSets) sets")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                            .padding(.vertical, 4)
                        }
                    }
                }
            }
            .listStyle(.plain)
            .navigationTitle("Calendar")
        }
    }
}

struct MonthGridView: View {
    let logs: [SessionLog]
    private let calendar = Calendar.current
    private let columns = Array(repeating: GridItem(.flexible(), spacing: 10), count: 7)
    private let weekdays = ["M", "T", "W", "T", "F", "S", "S"]

    var body: some View {
        let days = monthDays()

        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text(Date().formatted(.dateTime.year().month(.wide)))
                    .font(.title2)
                    .fontWeight(.black)
                Spacer()
            }

            HStack {
                ForEach(weekdays.indices, id: \.self) { index in
                    Text(weekdays[index])
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundStyle(.secondary)
                        .frame(maxWidth: .infinity)
                }
            }

            LazyVGrid(columns: columns, spacing: 12) {
                ForEach(days) { day in
                    if let date = day.date {
                        DayCell(date: date, hasLog: hasLog(on: date), isToday: calendar.isDateInToday(date))
                    } else {
                        Color.clear
                            .frame(height: 38)
                    }
                }
            }
        }
        .padding(.vertical, 8)
    }

    private func monthDays() -> [CalendarDay] {
        let now = Date()
        guard
            let monthInterval = calendar.dateInterval(of: .month, for: now),
            let firstWeekday = calendar.dateComponents([.weekday], from: monthInterval.start).weekday,
            let dayRange = calendar.range(of: .day, in: .month, for: now)
        else {
            return []
        }

        let leadingEmptyDays = (firstWeekday + 5) % 7
        var result = (0..<leadingEmptyDays).map { CalendarDay(id: "empty-\($0)", date: nil) }

        for day in dayRange {
            var components = calendar.dateComponents([.year, .month], from: now)
            components.day = day
            if let date = calendar.date(from: components) {
                result.append(CalendarDay(id: "day-\(day)", date: date))
            }
        }

        return result
    }

    private func hasLog(on date: Date) -> Bool {
        logs.contains { calendar.isDate($0.date, inSameDayAs: date) }
    }
}

struct CalendarDay: Identifiable {
    let id: String
    let date: Date?
}

struct DayCell: View {
    let date: Date
    let hasLog: Bool
    let isToday: Bool

    var body: some View {
        VStack(spacing: 5) {
            Text("\(Calendar.current.component(.day, from: date))")
                .font(.subheadline)
                .fontWeight(isToday ? .black : .semibold)
                .frame(width: 32, height: 32)
                .background(isToday ? Color.black : Color.clear)
                .foregroundStyle(isToday ? .white : .primary)
                .clipShape(Circle())
            Circle()
                .fill(hasLog ? Color.green : Color.clear)
                .frame(width: 6, height: 6)
        }
        .frame(height: 44)
    }
}
