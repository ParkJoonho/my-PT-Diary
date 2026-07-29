import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PtLessonDto } from './dto/pt-lesson-response.dto';
import { CreatePtLessonDto } from './dto/create-pt-lesson.dto';
import { ListPtLessonsQueryDto } from './dto/list-pt-lessons-query.dto';
import { UpdatePtLessonDto } from './dto/update-pt-lesson.dto';
import {
  PtLessonRow,
  PtLessonsRepositoryPort,
  PtLessonSummary,
} from './pt-lessons.repository.port';
import { PtLessonExerciseInput } from './pt-lessons.schemas';

const KOREAN_DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

@Injectable()
export class PtLessonsService {
  constructor(
    private readonly ptLessonsRepository: PtLessonsRepositoryPort,
  ) {}

  async createPtLesson(userKey: string, dto: CreatePtLessonDto) {
    const record = await this.ptLessonsRepository.createPtLesson({
      bodyParts: dto.bodyParts,
      comment: dto.comment ?? '',
      date: dto.date,
      equipment: dto.equipment,
      exercises: dto.exercises,
      id: randomUUID(),
      sessionNumber: dto.sessionNumber,
      summary: this.summarize(dto.exercises),
      userKey,
      warmUp: dto.warmUp ?? '',
      weeklyCompletionId: randomUUID(),
      weeklyCompletionNote: `PT ${dto.sessionNumber}세션`,
    });

    return this.mapRecord(record);
  }

  async updatePtLesson(
    userKey: string,
    lessonId: string,
    dto: UpdatePtLessonDto,
  ) {
    const record = await this.ptLessonsRepository.updatePtLesson({
      bodyParts: dto.bodyParts,
      comment: dto.comment ?? '',
      date: dto.date,
      equipment: dto.equipment,
      exercises: dto.exercises,
      id: lessonId,
      sessionNumber: dto.sessionNumber,
      summary: this.summarize(dto.exercises),
      userKey,
      warmUp: dto.warmUp ?? '',
      weeklyCompletionNote: `PT ${dto.sessionNumber}세션`,
    });

    return this.mapRecord(record);
  }

  async listPtLessons(userKey: string, query: ListPtLessonsQueryDto) {
    const records = await this.ptLessonsRepository.listPtLessons({
      from: query.from,
      to: query.to,
      userKey,
    });

    return records.map((record) => this.mapRecord(record));
  }

  async getPtLesson(userKey: string, lessonId: string) {
    const record = await this.ptLessonsRepository.findPtLesson({
      id: lessonId,
      userKey,
    });

    if (!record) {
      throw new NotFoundException('PT lesson not found.');
    }

    return this.mapRecord(record);
  }

  async deletePtLesson(userKey: string, lessonId: string) {
    await this.ptLessonsRepository.deletePtLesson({
      id: lessonId,
      userKey,
    });

    return {
      deleted: true,
    };
  }

  private summarize(exercises: PtLessonExerciseInput[]): PtLessonSummary {
    const setCount = exercises.reduce(
      (total, exercise) => total + exercise.sets.length,
      0,
    );
    const totalVolumeKg = exercises.reduce(
      (total, exercise) => total + exercise.volumeKg,
      0,
    );

    return {
      exerciseCount: exercises.length,
      setCount,
      totalVolumeKg,
    };
  }

  private mapRecord(record: PtLessonRow): PtLessonDto {
    return {
      bodyParts: record.body_parts,
      comment: record.comment,
      createdAt: new Date(record.created_at).getTime(),
      date: record.lesson_date,
      dayOfWeek: this.getDayOfWeek(record.lesson_date),
      equipment: record.equipment,
      exercises: record.exercises,
      id: record.id,
      sessionNumber: record.session_number,
      summary: record.summary,
      warmUp: record.warm_up,
    };
  }

  private getDayOfWeek(dateString: string) {
    const date = new Date(`${dateString}T00:00:00`);

    return KOREAN_DAY_LABELS[date.getDay()] ?? '';
  }
}
