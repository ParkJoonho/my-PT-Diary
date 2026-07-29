import { NotFoundException } from '@nestjs/common';
import { PtLessonsService } from '../pt-lessons.service';
import {
  PtLessonRow,
  PtLessonsRepositoryPort,
} from '../pt-lessons.repository.port';
import { CreatePtLessonDto } from '../dto/create-pt-lesson.dto';

const PT_LESSON_REQUEST: CreatePtLessonDto = {
  bodyParts: ['등', '팔'],
  comment: '등 수축이 안정적으로 잡혔어요.',
  date: '2026-07-29',
  equipment: ['머신', '프리웨이트'],
  exercises: [
    {
      estimatedOneRepMaxKg: 57.3,
      lbWeight: 88.2,
      maxWeightKg: 40,
      name: '랫풀다운',
      restTime: '75초',
      rir: '2',
      sets: [
        {
          id: '9ef1ba09-3d67-4125-8738-d0455cffefb8',
          reps: 12,
          weightKg: 35,
        },
        {
          id: '2e2cc773-620d-4b2f-ab87-51ead9d5b2c0',
          reps: 10,
          weightKg: 40,
        },
      ],
      volumeKg: 820,
    },
  ],
  sessionNumber: 18,
  warmUp: '밴드 풀어파트 2세트',
};

function createPtLessonRow(
  overrides: Partial<PtLessonRow> = {},
): PtLessonRow {
  return {
    body_parts: PT_LESSON_REQUEST.bodyParts,
    comment: PT_LESSON_REQUEST.comment,
    created_at: '2026-07-29 10:00:00+00',
    equipment: PT_LESSON_REQUEST.equipment,
    exercises: PT_LESSON_REQUEST.exercises,
    id: '5c5ae75d-e587-4a34-90b7-86f0872e1fdd',
    lesson_date: '2026-07-29',
    session_number: 18,
    summary: {
      exerciseCount: 1,
      setCount: 2,
      totalVolumeKg: 820,
    },
    updated_at: '2026-07-29 10:00:00+00',
    user_key: 'user-a',
    warm_up: PT_LESSON_REQUEST.warmUp,
    weekly_completion_id: '6ef6633a-cdd4-4df7-acd6-c51ee7f59b59',
    ...overrides,
  };
}

describe('PT 수업일지 서비스', () => {
  let repository: jest.Mocked<PtLessonsRepositoryPort>;
  let service: PtLessonsService;

  beforeEach(() => {
    repository = {
      createPtLesson: jest.fn(),
      deletePtLesson: jest.fn(),
      findPtLesson: jest.fn(),
      listPtLessons: jest.fn(),
      updatePtLesson: jest.fn(),
    };
    service = new PtLessonsService(repository);
  });

  it('PT 수업일지를 요약과 함께 저장한다', async () => {
    repository.createPtLesson.mockResolvedValue(createPtLessonRow());

    const result = await service.createPtLesson('user-a', PT_LESSON_REQUEST);
    const createArgs = repository.createPtLesson.mock.calls[0]?.[0];

    expect(createArgs).toEqual(
      expect.objectContaining({
        date: '2026-07-29',
        sessionNumber: 18,
        userKey: 'user-a',
        weeklyCompletionNote: 'PT 18세션',
      }),
    );
    expect(createArgs?.summary).toEqual({
      exerciseCount: 1,
      setCount: 2,
      totalVolumeKg: 820,
    });
    expect(result.dayOfWeek).toBe('수');
  });

  it('목록을 응답 DTO로 변환한다', async () => {
    repository.listPtLessons.mockResolvedValue([createPtLessonRow()]);

    const result = await service.listPtLessons('user-a', {
      from: '2026-07-01',
      to: '2026-07-31',
    });

    expect(repository.listPtLessons.mock.calls[0]?.[0]).toEqual({
      from: '2026-07-01',
      to: '2026-07-31',
      userKey: 'user-a',
    });
    expect(result[0]).toEqual(
      expect.objectContaining({
        date: '2026-07-29',
        id: '5c5ae75d-e587-4a34-90b7-86f0872e1fdd',
        sessionNumber: 18,
      }),
    );
  });

  it('상세 PT 수업일지가 없으면 NotFoundException을 던진다', async () => {
    repository.findPtLesson.mockResolvedValue(null);

    await expect(
      service.getPtLesson('user-a', 'missing-lesson'),
    ).rejects.toThrow(NotFoundException);
  });
});
