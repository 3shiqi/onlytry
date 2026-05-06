import SwiftData
import SwiftUI

struct ExerciseLibraryView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Exercise.name) private var exercises: [Exercise]
    @State private var searchText = ""
    @State private var showingAddExercise = false

    private var filteredExercises: [Exercise] {
        guard !searchText.isEmpty else {
            return exercises
        }

        return exercises.filter { exercise in
            exercise.name.localizedCaseInsensitiveContains(searchText)
                || exercise.tags.joined(separator: " ").localizedCaseInsensitiveContains(searchText)
                || exercise.biomechanics.pattern.localizedCaseInsensitiveContains(searchText)
        }
    }

    var body: some View {
        NavigationStack {
            List {
                Section {
                    ForEach(filteredExercises) { exercise in
                        NavigationLink {
                            ExerciseDetailView(exercise: exercise)
                        } label: {
                            ExerciseRow(exercise: exercise)
                        }
                    }
                }
            }
            .listStyle(.plain)
            .navigationTitle("Exercise Library")
            .searchable(text: $searchText, prompt: "Search name, tag, pattern")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Seed") {
                        ExerciseSeedData.seedIfNeeded(context: modelContext)
                    }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showingAddExercise = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAddExercise) {
                AddExerciseView()
            }
        }
    }
}

struct ExerciseRow: View {
    let exercise: Exercise

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(exercise.name)
                    .font(.headline)
                Spacer()
                Text(exercise.anatomy.region)
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundStyle(.secondary)
            }
            HStack(spacing: 6) {
                TagPill(text: exercise.biomechanics.pattern)
                TagPill(text: exercise.biomechanics.laterality)
                TagPill(text: "CNS \(exercise.programming.cnsCost)")
            }
        }
        .padding(.vertical, 6)
    }
}

struct ExerciseDetailView: View {
    let exercise: Exercise

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                VStack(alignment: .leading, spacing: 10) {
                    Text(exercise.name)
                        .font(.largeTitle)
                        .fontWeight(.black)
                    FlowTags(tags: exercise.tags)
                }

                DetailSection(title: "Biomechanics") {
                    DetailLine(label: "Pattern", value: exercise.biomechanics.pattern)
                    DetailLine(label: "Chain", value: exercise.biomechanics.kineticChain)
                    DetailLine(label: "Laterality", value: exercise.biomechanics.laterality)
                    DetailLine(label: "Plane", value: exercise.biomechanics.planeOfMotion.joined(separator: ", "))
                }

                DetailSection(title: "Programming") {
                    DetailLine(label: "Phase", value: exercise.programming.phaseCompatibility.joined(separator: ", "))
                    DetailLine(label: "CNS Cost", value: "\(exercise.programming.cnsCost)")
                    DetailLine(label: "Tempo", value: exercise.programming.recommendedTempo)
                }

                DetailSection(title: "Coaching Cues") {
                    ForEach(exercise.coaching.cues, id: \.self) { cue in
                        Label(cue, systemImage: "lightbulb")
                    }
                }

                if !exercise.clinical.contraindications.isEmpty {
                    DetailSection(title: "Clinical Guardrails") {
                        ForEach(exercise.clinical.contraindications, id: \.self) { item in
                            Label(item, systemImage: "exclamationmark.triangle")
                                .foregroundStyle(.red)
                        }
                    }
                }
            }
            .padding(20)
        }
        .navigationTitle("Detail")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct AddExerciseView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @State private var name = ""
    @State private var aliases = ""
    @State private var tags = ""
    @State private var region = "Lower"
    @State private var pattern = "Squat"
    @State private var kineticChain = "CKC"
    @State private var laterality = "Unilateral"
    @State private var plane = "Sagittal"
    @State private var phase = "Strength"
    @State private var cnsCost = 3
    @State private var equipment = "Bodyweight"
    @State private var trackingMetrics = "Reps"
    @State private var cueText = ""
    @State private var contraindications = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("Basics") {
                    TextField("Name", text: $name)
                    TextField("Aliases, comma separated", text: $aliases)
                    TextField("Tags, comma separated", text: $tags)
                    Picker("Region", selection: $region) {
                        ForEach(["Lower", "Upper", "Core", "Full"], id: \.self) { Text($0) }
                    }
                }

                Section("Biomechanics") {
                    Picker("Pattern", selection: $pattern) {
                        ForEach(["Squat", "Hinge", "Push", "Pull", "Rotation", "Core", "Locomotion"], id: \.self) { Text($0) }
                    }
                    Picker("Kinetic Chain", selection: $kineticChain) {
                        ForEach(["CKC", "OKC"], id: \.self) { Text($0) }
                    }
                    Picker("Laterality", selection: $laterality) {
                        ForEach(["Bilateral", "Unilateral", "Contralateral"], id: \.self) { Text($0) }
                    }
                    Picker("Plane", selection: $plane) {
                        ForEach(["Sagittal", "Frontal", "Transverse"], id: \.self) { Text($0) }
                    }
                }

                Section("Programming") {
                    Picker("Phase", selection: $phase) {
                        ForEach(["Warm-up", "Power", "Strength", "Core", "ESD", "Hypertrophy"], id: \.self) { Text($0) }
                    }
                    Stepper("CNS Cost \(cnsCost)", value: $cnsCost, in: 1...5)
                    TextField("Equipment, comma separated", text: $equipment)
                    TextField("Tracking metrics, comma separated", text: $trackingMetrics)
                }

                Section("Clinical / Coaching") {
                    TextField("Cues, comma separated", text: $cueText)
                    TextField("Contraindications, comma separated", text: $contraindications)
                }
            }
            .navigationTitle("New Exercise")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add", action: addExercise)
                        .disabled(name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
        }
    }

    private func addExercise() {
        let exercise = Exercise(
            name: name.trimmingCharacters(in: .whitespacesAndNewlines),
            aliases: list(from: aliases),
            tags: list(from: tags),
            anatomy: AnatomyData(region: region),
            biomechanics: BiomechanicsData(
                pattern: pattern,
                kineticChain: kineticChain,
                laterality: laterality,
                planeOfMotion: [plane]
            ),
            programming: ProgrammingData(
                cnsCost: cnsCost,
                phaseCompatibility: [phase]
            ),
            logistics: LogisticsData(
                equipment: list(from: equipment),
                trackingMetrics: list(from: trackingMetrics),
                unilateralTracking: laterality != "Bilateral"
            ),
            clinical: ClinicalData(contraindications: list(from: contraindications)),
            coaching: CoachingData(cues: list(from: cueText))
        )

        modelContext.insert(exercise)
        try? modelContext.save()
        dismiss()
    }

    private func list(from value: String) -> [String] {
        value
            .split(separator: ",")
            .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
            .filter { !$0.isEmpty }
    }
}

struct TagPill: View {
    let text: String

    var body: some View {
        Text(text)
            .font(.caption)
            .fontWeight(.semibold)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(Color(.secondarySystemBackground))
            .clipShape(RoundedRectangle(cornerRadius: 6))
    }
}

struct FlowTags: View {
    let tags: [String]

    var body: some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 86), spacing: 8)], alignment: .leading, spacing: 8) {
            ForEach(tags, id: \.self) { tag in
                TagPill(text: tag)
            }
        }
    }
}

struct DetailSection<Content: View>: View {
    let title: String
    let content: Content

    init(title: String, @ViewBuilder content: () -> Content) {
        self.title = title
        self.content = content()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title.uppercased())
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundStyle(.secondary)
            VStack(alignment: .leading, spacing: 10) {
                content
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding()
            .background(Color(.secondarySystemBackground))
            .clipShape(RoundedRectangle(cornerRadius: 8))
        }
    }
}

struct DetailLine: View {
    let label: String
    let value: String

    var body: some View {
        HStack {
            Text(label)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .fontWeight(.semibold)
        }
    }
}
