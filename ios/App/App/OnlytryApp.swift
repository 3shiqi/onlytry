import SwiftData
import SwiftUI

@main
struct OnlytryApp: App {
    let modelContainer: ModelContainer

    init() {
        do {
            modelContainer = try ModelContainer(for: Exercise.self, SessionLog.self)
        } catch {
            fatalError("Unable to initialize SwiftData container: \(error)")
        }
    }

    var body: some Scene {
        WindowGroup {
            RootTabView()
                .modelContainer(modelContainer)
        }
    }
}

struct RootTabView: View {
    @Environment(\.modelContext) private var modelContext

    var body: some View {
        TabView {
            SessionView()
                .tabItem {
                    Label("Session", systemImage: "bolt.fill")
                }

            ExerciseLibraryView()
                .tabItem {
                    Label("Library", systemImage: "square.grid.2x2.fill")
                }

            TrainingCalendarView()
                .tabItem {
                    Label("Calendar", systemImage: "calendar")
                }
        }
        .tint(.black)
        .task {
            ExerciseSeedData.seedIfNeeded(context: modelContext)
        }
    }
}
