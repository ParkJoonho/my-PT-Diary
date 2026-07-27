import { NotFoundException } from '@nestjs/common';
import { ExerciseGuideCatalogType } from '../dto/exercise-guide-response.dto';
import {
  BODY_PART_EXERCISE_GUIDES,
  EQUIPMENT_EXERCISE_GUIDES,
} from '../exercise-guides.catalog';
import {
  ExerciseGuideCatalogRecord,
  ExerciseGuidesRepositoryPort,
} from '../exercise-guides.repository.port';
import { ExerciseGuidesService } from '../exercise-guides.service';

describe('운동 배우기 서비스', () => {
  let repository: jest.Mocked<ExerciseGuidesRepositoryPort>;
  let service: ExerciseGuidesService;
  let allGuides: ExerciseGuideCatalogRecord[];

  beforeEach(() => {
    repository = {
      addLike: jest.fn(),
      createGuide: jest.fn(),
      deleteGuide: jest.fn(),
      getGuideById: jest.fn(),
      listLikeStatsForGuideIds: jest.fn(),
      listGuides: jest.fn(),
      removeLike: jest.fn(),
      updateGuide: jest.fn(),
    };

    service = new ExerciseGuidesService(repository);
    allGuides = [...BODY_PART_EXERCISE_GUIDES, ...EQUIPMENT_EXERCISE_GUIDES].map(
      (guide) => ({
        ...guide,
        createdAt: '2026-07-27T09:00:00.000Z',
        updatedAt: '2026-07-27T09:00:00.000Z',
      }),
    );
  });

  it('원본 카탈로그 개수와 ID 유일성을 유지한다', () => {
    const allIds = [
      ...BODY_PART_EXERCISE_GUIDES,
      ...EQUIPMENT_EXERCISE_GUIDES,
    ].map((guide) => guide.id);

    expect(BODY_PART_EXERCISE_GUIDES).toHaveLength(12);
    expect(EQUIPMENT_EXERCISE_GUIDES).toHaveLength(8);
    expect(new Set(allIds).size).toBe(20);
  });

  it('전체 가이드를 좋아요 정보와 합쳐 반환한다', async () => {
    repository.listGuides.mockResolvedValue(allGuides);
    repository.listLikeStatsForGuideIds.mockResolvedValue([
      { guideId: 'r1', likeCount: 2, likedByMe: true },
      { guideId: 'e7', likeCount: 5, likedByMe: false },
    ]);

    const result = await service.listExerciseGuides('user-a', {});

    expect(repository.listLikeStatsForGuideIds).toHaveBeenCalledWith({
      guideIds: expect.arrayContaining(['r1', 'r12', 'e1', 'e8']),
      userKey: 'user-a',
    });
    expect(result).toHaveLength(20);
    expect(result[0]).toEqual(
      expect.objectContaining({
        id: 'r1',
        likeCount: 5,
        likedByMe: true,
      }),
    );
    expect(result.find((guide) => guide.id === 'e7')).toEqual(
      expect.objectContaining({
        catalogType: ExerciseGuideCatalogType.Equipment,
        likeCount: 6,
        likedByMe: false,
      }),
    );
  });

  it('카탈로그 타입으로 필터링한다', async () => {
    repository.listGuides.mockResolvedValue(
      allGuides.filter(
        (guide) => guide.catalogType === ExerciseGuideCatalogType.BodyPart,
      ),
    );
    repository.listLikeStatsForGuideIds.mockResolvedValue([]);

    const result = await service.listExerciseGuides('user-a', {
      catalogType: ExerciseGuideCatalogType.BodyPart,
    });

    expect(result).toHaveLength(12);
    expect(
      result.every(
        (guide) => guide.catalogType === ExerciseGuideCatalogType.BodyPart,
      ),
    ).toBe(true);
    expect(repository.listGuides).toHaveBeenCalledWith({
      catalogType: ExerciseGuideCatalogType.BodyPart,
    });
  });

  it('상세 조회에서 현재 사용자 likedByMe와 전체 likeCount를 함께 계산한다', async () => {
    repository.getGuideById.mockResolvedValue(
      allGuides.find((guide) => guide.id === 'e3') ?? null,
    );
    repository.listLikeStatsForGuideIds.mockResolvedValue([
      { guideId: 'e3', likeCount: 4, likedByMe: false },
    ]);

    const result = await service.getExerciseGuide('user-b', 'e3');

    expect(result).toEqual(
      expect.objectContaining({
        id: 'e3',
        likeCount: 6,
        likedByMe: false,
        targetMuscles: '가슴, 팔',
      }),
    );
  });

  it('없는 가이드는 404를 던진다', async () => {
    repository.getGuideById.mockResolvedValue(null);

    await expect(
      service.getExerciseGuide('user-a', 'missing-guide'),
    ).rejects.toThrow(NotFoundException);
  });

  it('좋아요 설정은 추가 후 최신 합산 결과를 반환한다', async () => {
    repository.getGuideById.mockResolvedValue(
      allGuides.find((guide) => guide.id === 'r2') ?? null,
    );
    repository.addLike.mockResolvedValue(undefined);
    repository.listLikeStatsForGuideIds.mockResolvedValue([
      { guideId: 'r2', likeCount: 1, likedByMe: true },
    ]);

    const result = await service.setExerciseGuideLike('user-a', 'r2', true);

    expect(repository.addLike).toHaveBeenCalledWith({
      guideId: 'r2',
      userKey: 'user-a',
    });
    expect(result).toEqual(
      expect.objectContaining({
        id: 'r2',
        likeCount: 1,
        likedByMe: true,
      }),
    );
  });

  it('좋아요 해제는 삭제 후 최신 합산 결과를 반환한다', async () => {
    repository.getGuideById.mockResolvedValue(
      allGuides.find((guide) => guide.id === 'r6') ?? null,
    );
    repository.removeLike.mockResolvedValue(undefined);
    repository.listLikeStatsForGuideIds.mockResolvedValue([]);

    const result = await service.setExerciseGuideLike('user-a', 'r6', false);

    expect(repository.removeLike).toHaveBeenCalledWith({
      guideId: 'r6',
      userKey: 'user-a',
    });
    expect(result).toEqual(
      expect.objectContaining({
        id: 'r6',
        likeCount: 2,
        likedByMe: false,
      }),
    );
  });

  it('관리자 생성은 새 가이드를 저장하고 반환한다', async () => {
    repository.createGuide.mockResolvedValue({
      bodyPart: '가슴',
      catalogType: ExerciseGuideCatalogType.BodyPart,
      createdAt: '2026-07-27T10:00:00.000Z',
      description: '새 설명',
      displayOrder: 21,
      duration: '10:00',
      equipment: '덤벨',
      equipmentTypes: ['덤벨'],
      id: 'guide_created',
      initialLikeCount: 0,
      targetMuscles: '가슴',
      title: '새 가이드',
      updatedAt: '2026-07-27T10:00:00.000Z',
      videoUrl: 'https://www.youtube.com/embed/test',
    });

    const result = await service.createAdminExerciseGuide({
      bodyPart: '가슴',
      catalogType: ExerciseGuideCatalogType.BodyPart,
      description: '새 설명',
      displayOrder: 21,
      duration: '10:00',
      equipment: '덤벨',
      equipmentTypes: ['덤벨'],
      initialLikeCount: 0,
      targetMuscles: '가슴',
      title: '새 가이드',
      videoUrl: 'https://www.youtube.com/embed/test',
    });

    expect(repository.createGuide).toHaveBeenCalledWith({
      guide: expect.objectContaining({
        title: '새 가이드',
      }),
      guideId: expect.stringMatching(/^guide_/),
    });
    expect(result.id).toBe('guide_created');
  });

  it('관리자 수정은 없는 가이드에 대해 404를 던진다', async () => {
    repository.updateGuide.mockResolvedValue(null);

    await expect(
      service.updateAdminExerciseGuide('missing-guide', {
        bodyPart: '가슴',
        catalogType: ExerciseGuideCatalogType.BodyPart,
        description: '설명',
        displayOrder: 21,
        duration: '10:00',
        equipment: '덤벨',
        equipmentTypes: ['덤벨'],
        initialLikeCount: 0,
        targetMuscles: '가슴',
        title: '새 가이드',
        videoUrl: 'https://www.youtube.com/embed/test',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('관리자 삭제는 없는 가이드에 대해 404를 던진다', async () => {
    repository.deleteGuide.mockResolvedValue(false);

    await expect(
      service.deleteAdminExerciseGuide('missing-guide'),
    ).rejects.toThrow(NotFoundException);
  });
});
