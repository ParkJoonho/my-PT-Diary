import type {
  CreatePtLessonDto,
  PtLessonDto,
  UpdatePtLessonDto,
} from 'shared/api/generated/models';
import type { PtLesson } from '../types/pt-log';

export function toPtLesson(lesson: PtLessonDto): PtLesson {
  return {
    bodyParts: lesson.bodyParts,
    comment: lesson.comment,
    createdAt: lesson.createdAt,
    date: lesson.date,
    dayOfWeek: lesson.dayOfWeek,
    equipment: lesson.equipment,
    exercises: lesson.exercises,
    id: lesson.id,
    sessionNumber: lesson.sessionNumber,
    summary: lesson.summary,
    warmUp: lesson.warmUp,
  };
}

export function toCreatePtLessonPayload(lesson: PtLesson): CreatePtLessonDto {
  return {
    bodyParts: lesson.bodyParts,
    comment: lesson.comment,
    date: lesson.date,
    equipment: lesson.equipment,
    exercises: lesson.exercises,
    sessionNumber: lesson.sessionNumber,
    warmUp: lesson.warmUp,
  };
}

export function toUpdatePtLessonPayload(lesson: PtLesson): UpdatePtLessonDto {
  return toCreatePtLessonPayload(lesson);
}
