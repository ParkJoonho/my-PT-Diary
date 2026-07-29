import { PtLessonInput } from './pt-lessons.schemas';

export type PtLessonSummary = {
  exerciseCount: number;
  setCount: number;
  totalVolumeKg: number;
};

export type PtLessonRow = {
  id: string;
  user_key: string;
  lesson_date: string;
  session_number: number;
  body_parts: string[];
  equipment: string[];
  warm_up: string;
  exercises: PtLessonInput['exercises'];
  comment: string;
  summary: PtLessonSummary;
  weekly_completion_id: string | null;
  created_at: string;
  updated_at: string;
};

export abstract class PtLessonsRepositoryPort {
  abstract createPtLesson(params: {
    id: string;
    userKey: string;
    date: string;
    sessionNumber: number;
    bodyParts: string[];
    equipment: string[];
    warmUp: string;
    exercises: PtLessonInput['exercises'];
    comment: string;
    summary: PtLessonSummary;
    weeklyCompletionId: string;
    weeklyCompletionNote: string;
  }): Promise<PtLessonRow>;

  abstract updatePtLesson(params: {
    id: string;
    userKey: string;
    date: string;
    sessionNumber: number;
    bodyParts: string[];
    equipment: string[];
    warmUp: string;
    exercises: PtLessonInput['exercises'];
    comment: string;
    summary: PtLessonSummary;
    weeklyCompletionNote: string;
  }): Promise<PtLessonRow>;

  abstract listPtLessons(params: {
    userKey: string;
    from?: string;
    to?: string;
  }): Promise<PtLessonRow[]>;

  abstract findPtLesson(params: {
    id: string;
    userKey: string;
  }): Promise<PtLessonRow | null>;

  abstract deletePtLesson(params: {
    id: string;
    userKey: string;
  }): Promise<PtLessonRow>;
}
