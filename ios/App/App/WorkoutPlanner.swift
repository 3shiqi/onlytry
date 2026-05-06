import Foundation

struct PlannedExercise: Identifiable {
    let id: String
    let exercise: Exercise
    let sets: Int
    let prescription: String
    let phaseOverride: String?

    var phase: String {
        phaseOverride ?? exercise.programming.phaseCompatibility.first ?? "Strength"
    }
}

struct WorkoutPlan {
    let theme: String
    let exercises: [PlannedExercise]

    var totalSets: Int {
        exercises.reduce(0) { $0 + $1.sets }
    }
}

enum WorkoutPlanner {
    static let phaseOrder = ["Warm-up", "Power", "Strength", "Core", "ESD", "Hypertrophy"]
    static let defaultQuota = [
        "Warm-up": 2,
        "Power": 1,
        "Strength": 3,
        "Core": 1
    ]

    static func todayPlan(from exercises: [Exercise]) -> WorkoutPlan {
        var selected: [PlannedExercise] = []
        var usedIds = Set<String>()

        for phase in phaseOrder {
            let needed = defaultQuota[phase] ?? 0
            guard needed > 0 else {
                continue
            }

            let candidates = exercises
                .filter { $0.programming.phaseCompatibility.contains(phase) && !usedIds.contains($0.id) }
                .sorted { left, right in
                    if left.programming.cnsCost == right.programming.cnsCost {
                        return left.name < right.name
                    }

                    return left.programming.cnsCost < right.programming.cnsCost
                }
                .prefix(needed)

            for exercise in candidates {
                usedIds.insert(exercise.id)
                selected.append(
                    PlannedExercise(
                        id: exercise.id,
                        exercise: exercise,
                        sets: defaultSets(for: phase),
                        prescription: defaultPrescription(for: exercise, phase: phase),
                        phaseOverride: phase
                    )
                )
            }
        }

        return WorkoutPlan(theme: "今日训练", exercises: selected)
    }

    static func defaultSets(for phase: String) -> Int {
        switch phase {
        case "Warm-up":
            return 2
        case "Power", "Strength", "Core":
            return 3
        default:
            return 2
        }
    }

    static func defaultPrescription(for exercise: Exercise, phase: String) -> String {
        if exercise.logistics.trackingMetrics.contains("Time") {
            return "30 sec"
        }

        if exercise.logistics.trackingMetrics.contains("Weight") {
            return exercise.logistics.unilateralTracking ? "8 / side" : "8 reps"
        }

        return phase == "Warm-up" ? "8-10 reps" : "10 reps"
    }
}
