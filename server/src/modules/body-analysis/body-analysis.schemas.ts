import { z } from 'zod';

const base64ImageSchema = z
  .string()
  .trim()
  .min(100, 'Image base64 payload must be at least 100 characters long.')
  .max(30_000_000, 'Image base64 payload is too large.');

const isoDateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'photoDate must be in YYYY-MM-DD format.');

const bodyPartDetailSchema = z.object({
  note: z.string().trim().min(1).max(1000),
  value: z.string().trim().min(1).max(100),
});

const postureDetailSchema = z.object({
  note: z.string().trim().min(1).max(1000),
  score: z.number().min(1).max(5),
});

const gaitWearPatternSchema = z.object({
  description: z.string().trim().min(1).max(1000),
  leftRight: z.string().trim().min(1).max(100),
  type: z.string().trim().min(1).max(100),
});

const gaitTypeSchema = z.object({
  description: z.string().trim().min(1).max(1000),
  type: z.string().trim().min(1).max(150),
});

const gaitFootAlignmentSchema = z.object({
  ankleAlignment: postureDetailSchema,
  archType: z.string().trim().min(1).max(100),
  toeAlignment: bodyPartDetailSchema,
});

const gaitBodyImpactSchema = z.object({
  hipImpact: postureDetailSchema,
  kneeImpact: postureDetailSchema,
  spineImpact: postureDetailSchema,
});

const shoeSizeEstimateSchema = z.object({
  ageGroup: z.string().trim().min(1).max(50),
  estimatedSize: z.number().int().min(0).max(500),
  footLength: z.string().trim().min(1).max(100),
  footWidthCm: z.string().trim().min(1).max(100),
  gender: z.string().trim().min(1).max(50),
  genderReason: z.string().trim().min(1).max(1000),
  sizeRange: z.string().trim().min(1).max(100),
  sizeSystem: z.string().trim().min(1).max(200),
  width: z.string().trim().min(1).max(100),
  widthDescription: z.string().trim().min(1).max(1000),
});

const shoeRecommendationItemSchema = z.object({
  archSupport: z.string().trim().min(1).max(50),
  brand: z.string().trim().min(1).max(100),
  cushioning: z.string().trim().min(1).max(50),
  features: z.array(z.string().trim().min(1).max(200)).min(1).max(10),
  model: z.string().trim().min(1).max(150),
  priceRange: z.string().trim().min(1).max(100),
  reason: z.string().trim().min(1).max(1000),
  stability: z.string().trim().min(1).max(50),
  type: z.string().trim().min(1).max(100),
});

const shoeRecommendationBucketSchema = z.object({
  daily: z.array(shoeRecommendationItemSchema).min(1).max(5),
  workout: z.array(shoeRecommendationItemSchema).min(1).max(5),
});

const shoeRecommendationsSchema = z.object({
  afterCorrection: z.object({
    correctedGaitType: z.string().trim().min(1).max(200),
    daily: z.array(shoeRecommendationItemSchema).min(1).max(5),
    timeline: z.string().trim().min(1).max(100),
    workout: z.array(shoeRecommendationItemSchema).min(1).max(5),
  }),
  current: shoeRecommendationBucketSchema,
  matchingLogic: z.string().trim().min(1).max(3000),
});

const gaitAnalysisSchema = z.object({
  bodyImpact: gaitBodyImpactSchema,
  footAlignment: gaitFootAlignmentSchema,
  gaitRecommendations: z
    .array(z.string().trim().min(1).max(500))
    .min(1)
    .max(10),
  gaitType: gaitTypeSchema,
  shoeRecommendations: shoeRecommendationsSchema.optional(),
  shoeSizeEstimate: shoeSizeEstimateSchema.optional(),
  wearPattern: gaitWearPatternSchema,
});

const severityDetailSchema = z.object({
  angle: z.string().trim().min(1).max(100).optional(),
  areas: z.array(z.string().trim().min(1).max(100)).max(10).optional(),
  detected: z.boolean(),
  heightDiff: z.string().trim().min(1).max(100).optional(),
  note: z.string().trim().min(1).max(1000),
  severity: z.enum(['정상', '경미', '중등', '심각']).optional(),
});

const mobilityDetailSchema = z.object({
  note: z.string().trim().min(1).max(1000),
  score: z.number().min(1).max(5),
});

const squatDepthDetailSchema = z.object({
  note: z.string().trim().min(1).max(1000),
  value: z.enum(['풀', '하프', '쿼터']),
});

const priorityCorrectionSchema = z.object({
  description: z.string().trim().min(1).max(1000),
  exercise: z.string().trim().min(1).max(100),
  issue: z.string().trim().min(1).max(200),
  priority: z.enum(['높음', '중간', '낮음']),
});

const multiViewAnalysisSchema = z.object({
  backView: z
    .object({
      muscleImbalance: severityDetailSchema,
      pelvicAsymmetry: severityDetailSchema,
      scapularWinging: severityDetailSchema,
      scoliosis: severityDetailSchema,
      shoulderAsymmetry: severityDetailSchema,
    })
    .nullable(),
  compositeGrade: z.enum(['S', 'A', 'B', 'C', 'D', 'F']),
  compositePostureScore: z.number().min(0).max(100),
  priorityCorrections: z.array(priorityCorrectionSchema).max(10),
  sideView: z
    .object({
      anteriorPelvicTilt: severityDetailSchema,
      forwardHeadPosture: severityDetailSchema,
      kneeHyperextension: severityDetailSchema,
      roundedShoulders: severityDetailSchema,
      spinalCurve: z.object({
        note: z.string().trim().min(1).max(1000),
        type: z.enum(['정상', '과도전만', '과도후만', '평편등']),
      }),
    })
    .nullable(),
  squatView: z
    .object({
      ankleMobility: mobilityDetailSchema,
      balance: mobilityDetailSchema,
      hipMobility: mobilityDetailSchema,
      kneeValgus: severityDetailSchema,
      squatDepth: squatDepthDetailSchema,
      trunkLean: severityDetailSchema,
    })
    .nullable(),
  viewsAnalyzed: z.array(z.enum(['front', 'side', 'back', 'squat'])).max(4),
});

const predictionSchema = z.object({
  currentDate: isoDateStringSchema,
  currentEstimate: z.string().trim().min(1).max(2000),
  daysSincePhoto: z.number().int().min(0).max(36500),
  exerciseImpact: z.string().trim().min(1).max(2000).nullable(),
  milestones: z.array(z.string().trim().min(1).max(500)).max(10),
  oneYearPrediction: z.string().trim().min(1).max(2000),
  photoDate: isoDateStringSchema,
  riskFactors: z.array(z.string().trim().min(1).max(500)).max(10),
  sixMonthPrediction: z.string().trim().min(1).max(2000),
  threeMonthPrediction: z.string().trim().min(1).max(2000),
});

const medicalRiskItemSchema = z.object({
  area: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(1000),
  preventionTip: z.string().trim().min(1).max(1000),
  riskLevel: z.string().trim().min(1).max(30),
});

const medicalExerciseWarningSchema = z.object({
  alternative: z.string().trim().min(1).max(1000),
  exercise: z.string().trim().min(1).max(100),
  reason: z.string().trim().min(1).max(1000),
});

const medicalRehabExerciseSchema = z.object({
  description: z.string().trim().min(1).max(1000),
  frequency: z.string().trim().min(1).max(200),
  name: z.string().trim().min(1).max(100),
  precaution: z.string().trim().min(1).max(500),
  targetArea: z.string().trim().min(1).max(100),
});

const medicalAnalysisSchema = z.object({
  bodyStructureImpact: z.string().trim().min(1).max(2000),
  disclaimer: z.string().trim().min(1).max(2000),
  exerciseWarnings: z.array(medicalExerciseWarningSchema).max(10),
  lifestyleAdvice: z.array(z.string().trim().min(1).max(500)).max(10),
  referralSuggestion: z.string().trim().min(1).max(2000),
  rehabExercises: z.array(medicalRehabExerciseSchema).max(10),
  musculoskeletalRisks: z.array(medicalRiskItemSchema).max(10),
  symptomAssessment: z.string().trim().min(1).max(2000),
});

export const bodyAnalysisResultSchema = z.object({
  bodyType: z.enum(['I', 'V', 'A', 'H', 'X', 'O']),
  bodyTypeDescription: z.string().trim().min(1).max(2000),
  gaitAnalysis: gaitAnalysisSchema.nullable(),
  lowerBody: z.object({
    hipWidth: bodyPartDetailSchema,
    kneeAlignment: bodyPartDetailSchema,
    legLength: bodyPartDetailSchema,
  }),
  medicalAnalysis: medicalAnalysisSchema.nullable(),
  multiViewAnalysis: multiViewAnalysisSchema.nullable(),
  posture: z.object({
    hipBalance: postureDetailSchema,
    overallAlignment: postureDetailSchema,
    shoulderBalance: postureDetailSchema,
    spinalCurvature: postureDetailSchema,
  }),
  prediction: predictionSchema.nullable(),
  ratios: z.object({
    armToHeight: z.number().min(0).max(5),
    upperToLower: z.number().min(0).max(5),
  }),
  recommendations: z.array(z.string().trim().min(1).max(500)).min(1).max(10),
  summary: z.string().trim().min(1).max(3000),
  upperBody: z.object({
    armLength: bodyPartDetailSchema,
    neckLength: bodyPartDetailSchema,
    shoulderWidth: bodyPartDetailSchema,
    spineAlignment: bodyPartDetailSchema,
  }),
});

export const createBodyAnalysisSchema = z.object({
  backImageBase64: base64ImageSchema.optional(),
  height: z.coerce
    .number()
    .int()
    .min(50, 'height must be at least 50cm.')
    .max(300, 'height must be 300cm or fewer.')
    .optional(),
  imageBase64: base64ImageSchema,
  medicalSymptoms: z
    .string()
    .trim()
    .min(1, 'medicalSymptoms cannot be empty.')
    .max(1000, 'medicalSymptoms must be 1000 characters or fewer.')
    .optional(),
  photoDate: isoDateStringSchema.optional(),
  shoeImageBase64: base64ImageSchema.optional(),
  sideImageBase64: base64ImageSchema.optional(),
  squatImageBase64: base64ImageSchema.optional(),
});

export type BodyAnalysisOutput = z.infer<typeof bodyAnalysisResultSchema>;
export type CreateBodyAnalysisInput = z.infer<typeof createBodyAnalysisSchema>;
