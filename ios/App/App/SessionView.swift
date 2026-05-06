import SwiftData
import SwiftUI

struct SessionView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Exercise.name) private var exercises: [Exercise]
    @State private var currentIndex = 0
    @State private var completedSetCount = 0
    @State private var showingSummary = false

    private var plan: WorkoutPlan {
        WorkoutPlanner.todayPlan(from: exercises)
    }

    private var currentItem: PlannedExercise? {
        guard plan.exercises.indices.contains(currentIndex) else {
            return nil
        }

        return plan.exercises[currentIndex]
    }

    var body: some View {
        NavigationStack {
            Group {
                if let currentItem {
                    VStack(spacing: 28) {
                        SessionHeader(plan: plan, currentIndex: currentIndex)
                        ExerciseFocusCard(item: currentItem, completedSetCount: completedSetCount)
                        Spacer(minLength: 24)
                        Button(action: completeSet) {
                            Text(completedSetCount + 1 >= currentItem.sets ? "COMPLETE EXERCISE" : "CHECK")
                                .font(.headline)
                                .frame(maxWidth: .infinity)
                                .frame(height: 72)
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(.black)
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                    }
                    .padding(20)
                } else {
                    ContentUnavailableView(
                        "No Exercise Library",
                        systemImage: "square.grid.2x2",
                        description: Text("Add or seed exercises from the Library tab.")
                    )
                }
            }
            .navigationTitle("Today")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Reset", action: resetSession)
                        .disabled(plan.exercises.isEmpty)
                }
            }
            .sheet(isPresented: $showingSummary) {
                SessionSummaryView(plan: plan, onRestart: resetSession)
                    .presentationDetents([.medium])
            }
        }
    }

    private func completeSet() {
        guard let currentItem else {
            return
        }

        let nextSetCount = completedSetCount + 1

        if nextSetCount < currentItem.sets {
            completedSetCount = nextSetCount
            return
        }

        if currentIndex < plan.exercises.count - 1 {
            currentIndex += 1
            completedSetCount = 0
            return
        }

        logCompletedSession()
        showingSummary = true
    }

    private func resetSession() {
        currentIndex = 0
        completedSetCount = 0
        showingSummary = false
    }

    private func logCompletedSession() {
        let log = SessionLog(
            theme: plan.theme,
            exerciseNames: plan.exercises.map(\.exercise.name),
            completedSets: plan.totalSets
        )

        modelContext.insert(log)
        try? modelContext.save()
    }
}

struct SessionHeader: View {
    let plan: WorkoutPlan
    let currentIndex: Int

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("TODAY SESSION")
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundStyle(.secondary)
            HStack(alignment: .firstTextBaseline) {
                Text(plan.theme)
                    .font(.largeTitle)
                    .fontWeight(.black)
                Spacer()
                Text("\(min(currentIndex + 1, max(plan.exercises.count, 1)))/\(plan.exercises.count)")
                    .font(.headline)
                    .foregroundStyle(.secondary)
            }
            ProgressView(value: Double(currentIndex + 1), total: Double(max(plan.exercises.count, 1)))
                .tint(.green)
        }
    }
}

struct ExerciseFocusCard: View {
    let item: PlannedExercise
    let completedSetCount: Int

    var body: some View {
        VStack(spacing: 22) {
            VStack(spacing: 8) {
                Text(item.phase.uppercased())
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundStyle(.secondary)
                Text(item.exercise.name)
                    .font(.system(size: 34, weight: .black))
                    .multilineTextAlignment(.center)
            }

            VStack(spacing: 12) {
                Text(item.prescription)
                    .font(.system(size: 44, weight: .black))
                Text("Set \(min(completedSetCount + 1, item.sets)) of \(item.sets)")
                    .font(.headline)
                    .foregroundStyle(.secondary)
            }

            VStack(alignment: .leading, spacing: 10) {
                ForEach(item.exercise.coaching.cues.prefix(3), id: \.self) { cue in
                    Label(cue, systemImage: "lightbulb")
                        .font(.subheadline)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding()
            .background(Color(.secondarySystemBackground))
            .clipShape(RoundedRectangle(cornerRadius: 8))
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 20)
    }
}

struct SessionSummaryView: View {
    let plan: WorkoutPlan
    let onRestart: () -> Void
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(spacing: 22) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 52))
                .foregroundStyle(.green)
            Text("Session Complete")
                .font(.title)
                .fontWeight(.black)
            Text("\(plan.exercises.count) exercises • \(plan.totalSets) sets")
                .foregroundStyle(.secondary)
            Button("Start New Session") {
                dismiss()
                onRestart()
            }
            .buttonStyle(.borderedProminent)
            .tint(.black)
        }
        .padding(24)
    }
}
