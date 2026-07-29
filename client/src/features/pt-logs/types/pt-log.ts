export type PtDateRange = {
  end: string | null;
  start: string | null;
};

export type PtExerciseSet = {
  id: string;
  reps: number;
  weightKg: number;
};

export type PtExerciseEntry = {
  estimatedOneRepMaxKg: number;
  lbWeight: number;
  maxWeightKg: number;
  name: string;
  restTime: string;
  rir: string;
  sets: PtExerciseSet[];
  volumeKg: number;
};

export type PtLessonSummary = {
  exerciseCount: number;
  setCount: number;
  totalVolumeKg: number;
};

export type PtLesson = {
  bodyParts: string[];
  comment: string;
  createdAt: number;
  date: string;
  dayOfWeek: string;
  equipment: string[];
  exercises: PtExerciseEntry[];
  id: string;
  sessionNumber: number;
  summary: PtLessonSummary;
  warmUp: string;
};
