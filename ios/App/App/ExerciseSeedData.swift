import Foundation
import SwiftData

enum ExerciseSeedData {
    static func seedIfNeeded(context: ModelContext) {
        let descriptor = FetchDescriptor<Exercise>()
        let existingCount = (try? context.fetchCount(descriptor)) ?? 0

        guard existingCount == 0 else {
            return
        }

        makeSeedExercises().forEach { context.insert($0) }
        try? context.save()
    }

    static func makeSeedExercises() -> [Exercise] {
        [
            Exercise(
                id: "w1",
                name: "翻书 (Open Book)",
                aliases: ["Open Book", "仰卧胸椎旋转"],
                tags: ["热身", "胸椎", "旋转"],
                anatomy: AnatomyData(
                    primaryMovers: ["Thoracic Rotators"],
                    synergists: ["Pectoralis Major", "Obliques"],
                    region: "Upper"
                ),
                biomechanics: BiomechanicsData(
                    pattern: "Rotation",
                    kineticChain: "OKC",
                    laterality: "Unilateral",
                    planeOfMotion: ["Transverse"]
                ),
                programming: ProgrammingData(
                    cnsCost: 1,
                    phaseCompatibility: ["Warm-up"],
                    recommendedTempo: "2-1-2-0"
                ),
                logistics: LogisticsData(
                    equipment: ["Bodyweight", "Mat"],
                    trackingMetrics: ["Reps"],
                    unilateralTracking: true
                ),
                coaching: CoachingData(
                    cues: ["膝盖叠放保持稳定", "呼气时打开上侧肩膀", "视线跟随手掌移动"],
                    regressionIds: ["w1-reg"]
                )
            ),
            Exercise(
                id: "w2",
                name: "90/90 髋转换",
                aliases: ["90/90 Hip Switch"],
                tags: ["热身", "髋关节", "活动度"],
                anatomy: AnatomyData(
                    primaryMovers: ["Hip Rotators"],
                    synergists: ["Adductors", "Gluteus Medius"],
                    region: "Lower"
                ),
                biomechanics: BiomechanicsData(
                    pattern: "Mobility",
                    kineticChain: "CKC",
                    laterality: "Bilateral",
                    planeOfMotion: ["Transverse", "Frontal"],
                    contractionType: ["Controlled Articular"]
                ),
                programming: ProgrammingData(
                    cnsCost: 1,
                    phaseCompatibility: ["Warm-up"],
                    energySystemTax: EnergySystem(oxidative: 20),
                    maxFrequencyPerWeek: 6,
                    recommendedTempo: "3-1-3-0"
                ),
                logistics: LogisticsData(
                    equipment: ["Bodyweight", "Mat"],
                    trackingMetrics: ["Reps"],
                    unilateralTracking: true
                ),
                clinical: ClinicalData(
                    mobilityPrerequisites: ["Pain-free Hip Rotation"],
                    injuryRiskZones: ["Hip", "Knee"]
                ),
                coaching: CoachingData(
                    cues: ["坐骨轻轻扎地", "膝盖跟随髋部旋转", "全程保持可控呼吸"],
                    regressionIds: ["w2-reg"]
                )
            ),
            Exercise(
                id: "p1",
                name: "药球侧抛",
                aliases: ["Medicine Ball Side Throw"],
                tags: ["爆发", "旋转", "核心"],
                anatomy: AnatomyData(
                    primaryMovers: ["Obliques", "Gluteus Maximus"],
                    synergists: ["Latissimus Dorsi", "Hip Rotators"],
                    region: "Full"
                ),
                biomechanics: BiomechanicsData(
                    pattern: "Rotation",
                    kineticChain: "CKC",
                    laterality: "Bilateral",
                    planeOfMotion: ["Transverse"],
                    contractionType: ["Concentric"]
                ),
                programming: ProgrammingData(
                    cnsCost: 4,
                    phaseCompatibility: ["Power"],
                    energySystemTax: EnergySystem(atpPc: 80, glycolytic: 20, oxidative: 0),
                    maxFrequencyPerWeek: 2,
                    recommendedTempo: "X-0-X-0"
                ),
                logistics: LogisticsData(
                    equipment: ["Medicine Ball", "Wall"],
                    setupComplexity: 3,
                    trackingMetrics: ["Reps"],
                    unilateralTracking: true
                ),
                clinical: ClinicalData(
                    contraindications: ["Acute Lumbar Pain"],
                    injuryRiskZones: ["Lumbar Spine", "Shoulder"]
                ),
                coaching: CoachingData(
                    cues: ["核心先锁住", "髋部带动上肢", "出手要快但不丢姿势"],
                    regressionIds: ["p1-reg"]
                )
            ),
            Exercise(
                id: "s1",
                name: "单腿硬拉",
                aliases: ["Single Leg RDL"],
                tags: ["下肢单侧", "髋铰链", "平衡"],
                anatomy: AnatomyData(
                    primaryMovers: ["Hamstrings", "Gluteus Maximus"],
                    synergists: ["Adductors", "Core"],
                    antagonists: ["Quadriceps"],
                    region: "Lower"
                ),
                biomechanics: BiomechanicsData(
                    pattern: "Hinge",
                    kineticChain: "CKC",
                    laterality: "Unilateral",
                    planeOfMotion: ["Sagittal", "Frontal"]
                ),
                programming: ProgrammingData(
                    cnsCost: 4,
                    phaseCompatibility: ["Strength"],
                    maxFrequencyPerWeek: 3,
                    recommendedTempo: "3-1-1-0"
                ),
                logistics: LogisticsData(
                    equipment: ["Dumbbell"],
                    setupComplexity: 2,
                    trackingMetrics: ["Weight", "Reps"],
                    unilateralTracking: true
                ),
                clinical: ClinicalData(
                    mobilityPrerequisites: ["Hip Hinge Control"],
                    contraindications: ["Acute Hamstring Strain"],
                    injuryRiskZones: ["Hamstring", "Lumbar Spine"]
                ),
                coaching: CoachingData(
                    cues: ["脚底三点稳定", "髋关节向后找墙", "骨盆保持水平"],
                    regressionIds: ["s1-reg"]
                )
            ),
            Exercise(
                name: "保加利亚分腿蹲",
                aliases: ["后脚抬高蹲", "BSS"],
                tags: ["下肢单侧", "臀腿复合"],
                anatomy: AnatomyData(
                    primaryMovers: ["Gluteus Maximus", "Quadriceps"],
                    synergists: ["Hamstrings", "Core"],
                    region: "Lower"
                ),
                biomechanics: BiomechanicsData(
                    pattern: "Squat",
                    kineticChain: "CKC",
                    laterality: "Unilateral",
                    planeOfMotion: ["Sagittal", "Frontal"]
                ),
                programming: ProgrammingData(
                    cnsCost: 4,
                    phaseCompatibility: ["Strength", "Hypertrophy"],
                    recommendedTempo: "3-1-1-0"
                ),
                logistics: LogisticsData(
                    equipment: ["Dumbbell", "Bench"],
                    setupComplexity: 3,
                    trackingMetrics: ["Weight", "Reps"],
                    unilateralTracking: true
                ),
                clinical: ClinicalData(
                    contraindications: ["Patellar Tendinopathy (急性髌腱炎)"]
                ),
                coaching: CoachingData(
                    cues: ["前脚全脚掌抓地", "后脚背轻轻搭在凳上", "躯干微前倾以激活臀部"]
                )
            ),
            Exercise(
                id: "s2",
                name: "单臂划船",
                aliases: ["One Arm Row"],
                tags: ["上肢拉", "肩胛控制", "背部"],
                anatomy: AnatomyData(
                    primaryMovers: ["Latissimus Dorsi", "Rhomboids"],
                    synergists: ["Biceps", "Posterior Deltoid"],
                    region: "Upper"
                ),
                biomechanics: BiomechanicsData(
                    pattern: "Pull",
                    kineticChain: "OKC",
                    laterality: "Unilateral",
                    planeOfMotion: ["Sagittal", "Transverse"]
                ),
                programming: ProgrammingData(
                    cnsCost: 3,
                    phaseCompatibility: ["Strength"],
                    maxFrequencyPerWeek: 3,
                    recommendedTempo: "2-1-1-1"
                ),
                logistics: LogisticsData(
                    equipment: ["Dumbbell", "Bench"],
                    setupComplexity: 2,
                    trackingMetrics: ["Weight", "Reps"],
                    unilateralTracking: true
                ),
                clinical: ClinicalData(
                    contraindications: ["Acute Shoulder Impingement"],
                    injuryRiskZones: ["Shoulder", "Lumbar Spine"]
                ),
                coaching: CoachingData(
                    cues: ["先让肩胛向后下方滑动", "肘部贴近身体拉向髋部", "躯干不要旋转借力"],
                    regressionIds: ["s2-reg"]
                )
            ),
            Exercise(
                id: "c1",
                name: "死虫抗阻",
                aliases: ["Dead Bug"],
                tags: ["核心", "抗伸展", "康复"],
                anatomy: AnatomyData(
                    primaryMovers: ["Transverse Abdominis"],
                    synergists: ["Obliques", "Hip Flexors"],
                    region: "Core"
                ),
                biomechanics: BiomechanicsData(
                    pattern: "Core",
                    kineticChain: "OKC",
                    laterality: "Contralateral",
                    planeOfMotion: ["Sagittal"],
                    contractionType: ["Isometric"]
                ),
                programming: ProgrammingData(
                    cnsCost: 2,
                    phaseCompatibility: ["Core"],
                    recommendedTempo: "2-2-2-0"
                ),
                logistics: LogisticsData(
                    equipment: ["Bodyweight", "Band"],
                    trackingMetrics: ["Time"],
                    unilateralTracking: true
                ),
                coaching: CoachingData(
                    cues: ["腰椎压紧地面", "呼气时对侧伸展", "肋骨保持回收"]
                )
            )
        ]
    }
}
