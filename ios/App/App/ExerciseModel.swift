import Foundation
import SwiftData

@Model
final class Exercise {
    @Attribute(.unique) var id: String
    var name: String
    var aliases: [String]
    var tags: [String]
    var anatomy: AnatomyData
    var biomechanics: BiomechanicsData
    var programming: ProgrammingData
    var logistics: LogisticsData
    var clinical: ClinicalData
    var coaching: CoachingData
    var media: MediaData

    init(
        id: String = UUID().uuidString,
        name: String,
        aliases: [String] = [],
        tags: [String] = [],
        anatomy: AnatomyData,
        biomechanics: BiomechanicsData,
        programming: ProgrammingData,
        logistics: LogisticsData,
        clinical: ClinicalData = ClinicalData(),
        coaching: CoachingData = CoachingData(),
        media: MediaData = MediaData()
    ) {
        self.id = id
        self.name = name
        self.aliases = aliases
        self.tags = tags
        self.anatomy = anatomy
        self.biomechanics = biomechanics
        self.programming = programming
        self.logistics = logistics
        self.clinical = clinical
        self.coaching = coaching
        self.media = media
    }
}

struct AnatomyData: Codable {
    var primaryMovers: [String]
    var synergists: [String]
    var antagonists: [String]
    var region: String

    init(
        primaryMovers: [String] = [],
        synergists: [String] = [],
        antagonists: [String] = [],
        region: String = "Full"
    ) {
        self.primaryMovers = primaryMovers
        self.synergists = synergists
        self.antagonists = antagonists
        self.region = region
    }
}

struct BiomechanicsData: Codable {
    var pattern: String
    var kineticChain: String
    var laterality: String
    var planeOfMotion: [String]
    var contractionType: [String]

    init(
        pattern: String,
        kineticChain: String,
        laterality: String,
        planeOfMotion: [String] = ["Sagittal"],
        contractionType: [String] = ["Concentric", "Eccentric"]
    ) {
        self.pattern = pattern
        self.kineticChain = kineticChain
        self.laterality = laterality
        self.planeOfMotion = planeOfMotion
        self.contractionType = contractionType
    }
}

struct ProgrammingData: Codable {
    var cnsCost: Int
    var phaseCompatibility: [String]
    var energySystemTax: EnergySystem
    var maxFrequencyPerWeek: Int
    var recommendedTempo: String

    init(
        cnsCost: Int,
        phaseCompatibility: [String],
        energySystemTax: EnergySystem = EnergySystem(),
        maxFrequencyPerWeek: Int = 3,
        recommendedTempo: String = "2-0-1-0"
    ) {
        self.cnsCost = cnsCost
        self.phaseCompatibility = phaseCompatibility
        self.energySystemTax = energySystemTax
        self.maxFrequencyPerWeek = maxFrequencyPerWeek
        self.recommendedTempo = recommendedTempo
    }
}

struct EnergySystem: Codable {
    var atpPc: Int
    var glycolytic: Int
    var oxidative: Int

    init(atpPc: Int = 0, glycolytic: Int = 0, oxidative: Int = 0) {
        self.atpPc = atpPc
        self.glycolytic = glycolytic
        self.oxidative = oxidative
    }
}

struct LogisticsData: Codable {
    var equipment: [String]
    var setupComplexity: Int
    var trackingMetrics: [String]
    var unilateralTracking: Bool

    init(
        equipment: [String] = ["Bodyweight"],
        setupComplexity: Int = 1,
        trackingMetrics: [String] = ["Reps"],
        unilateralTracking: Bool = false
    ) {
        self.equipment = equipment
        self.setupComplexity = setupComplexity
        self.trackingMetrics = trackingMetrics
        self.unilateralTracking = unilateralTracking
    }
}

struct ClinicalData: Codable {
    var mobilityPrerequisites: [String]
    var contraindications: [String]
    var injuryRiskZones: [String]

    init(
        mobilityPrerequisites: [String] = [],
        contraindications: [String] = [],
        injuryRiskZones: [String] = []
    ) {
        self.mobilityPrerequisites = mobilityPrerequisites
        self.contraindications = contraindications
        self.injuryRiskZones = injuryRiskZones
    }
}

struct CoachingData: Codable {
    var cues: [String]
    var commonFaults: [String]
    var regressionIds: [String]
    var progressionIds: [String]

    init(
        cues: [String] = [],
        commonFaults: [String] = [],
        regressionIds: [String] = [],
        progressionIds: [String] = []
    ) {
        self.cues = cues
        self.commonFaults = commonFaults
        self.regressionIds = regressionIds
        self.progressionIds = progressionIds
    }
}

struct MediaData: Codable {
    var thumbnail: String
    var loopVideo: String
    var externalReference: String

    init(thumbnail: String = "", loopVideo: String = "", externalReference: String = "") {
        self.thumbnail = thumbnail
        self.loopVideo = loopVideo
        self.externalReference = externalReference
    }
}

@Model
final class SessionLog {
    @Attribute(.unique) var id: String
    var date: Date
    var theme: String
    var exerciseNames: [String]
    var completedSets: Int

    init(
        id: String = UUID().uuidString,
        date: Date = Date(),
        theme: String,
        exerciseNames: [String],
        completedSets: Int
    ) {
        self.id = id
        self.date = date
        self.theme = theme
        self.exerciseNames = exerciseNames
        self.completedSets = completedSets
    }
}
