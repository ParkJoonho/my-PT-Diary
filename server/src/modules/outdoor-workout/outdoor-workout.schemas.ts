import { z } from 'zod';

const outdoorWorkoutBodyAnalysisSchema = z
  .object({
    qualitativeData: z.unknown().optional(),
    quantitativeData: z.unknown().optional(),
    rawResult: z.unknown().optional(),
  })
  .strict();

export const outdoorWorkoutElevationPointSchema = z
  .object({
    point: z.number().int().min(0).max(1000),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    elevation: z.number().min(-500).max(10_000),
  })
  .strict();

export const createOutdoorWorkoutPlanSchema = z
  .object({
    startLat: z.number().min(-90).max(90),
    startLng: z.number().min(-180).max(180),
    endLat: z.number().min(-90).max(90),
    endLng: z.number().min(-180).max(180),
    distanceKm: z.number().positive().max(100),
    mode: z.enum(['walking', 'hiking']),
    radiusKm: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    elevationData: z
      .array(outdoorWorkoutElevationPointSchema)
      .min(1)
      .max(50)
      .optional(),
    bodyAnalysis: outdoorWorkoutBodyAnalysisSchema.optional(),
  })
  .strict();

const outdoorWorkoutCourseWaypointSchema = z
  .object({
    order: z.coerce.number().int().min(1).max(20),
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
    label: z.string().trim().min(1).max(100),
    elevation: z.coerce.number().min(-500).max(10_000),
    direction: z.string().trim().min(1).max(300),
    slope: z.string().trim().min(1).max(120),
  })
  .strict();

const outdoorWorkoutRouteSegmentSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    distance: z.string().trim().min(1).max(40),
    elevationChange: z.string().trim().min(1).max(80),
    difficulty: z.string().trim().min(1).max(40),
    startWaypoint: z.coerce.number().int().min(1).max(20).optional(),
    endWaypoint: z.coerce.number().int().min(1).max(20).optional(),
    direction: z.string().trim().min(1).max(300).optional(),
    terrainType: z.string().trim().min(1).max(100).optional(),
    slopeInfo: z.string().trim().min(1).max(120).optional(),
    breathingTip: z.string().trim().min(1).max(300),
    restRecommendation: z.string().trim().min(1).max(300),
    bodyTypeExercise: z.string().trim().min(1).max(300).optional(),
  })
  .strict();

const outdoorWorkoutBodyTypeExerciseSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    description: z.string().trim().min(1).max(400),
    targetArea: z.string().trim().min(1).max(100),
    duration: z.string().trim().min(1).max(80),
    benefit: z.string().trim().min(1).max(300),
  })
  .strict();

export const outdoorWorkoutPlanSchema = z
  .object({
    routeType: z.string().trim().min(1).max(100),
    totalDistance: z.string().trim().min(1).max(40),
    estimatedTime: z.string().trim().min(1).max(80),
    estimatedCalories: z.string().trim().min(1).max(80),
    elevationGain: z.string().trim().min(1).max(80),
    difficulty: z.string().trim().min(1).max(40),
    summary: z.string().trim().min(1).max(500),
    courseWaypoints: z
      .array(outdoorWorkoutCourseWaypointSchema)
      .min(2)
      .max(10)
      .optional(),
    segments: z.array(outdoorWorkoutRouteSegmentSchema).min(1).max(6),
    generalTips: z.array(z.string().trim().min(1).max(300)).min(1).max(7),
    bodyTypeExercises: z
      .array(outdoorWorkoutBodyTypeExerciseSchema)
      .min(1)
      .max(5)
      .optional(),
    personalizedNote: z.string().trim().min(1).max(500).optional(),
  })
  .strict();

export type CreateOutdoorWorkoutPlanInput = z.infer<
  typeof createOutdoorWorkoutPlanSchema
>;
export type OutdoorWorkoutPlanOutput = z.infer<
  typeof outdoorWorkoutPlanSchema
>;
