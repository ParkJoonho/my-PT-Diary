import { NotFoundException } from '@nestjs/common';
import { ExerciseGuideCatalogType } from '../dto/exercise-guide-response.dto';
import {
  BODY_PART_EXERCISE_GUIDES,
  EQUIPMENT_EXERCISE_GUIDES,
} from '../exercise-guides.catalog';
import { ExerciseGuidesRepositoryPort } from '../exercise-guides.repository.port';
import { ExerciseGuidesService } from '../exercise-guides.service';

describe('운동 배우기 서비스', () => {
  let repository: jest.Mocked<ExerciseGuidesRepositoryPort>;
  let service: ExerciseGuidesService;

  beforeEach(() => {
    repository = {
      addLike: jest.fn(),
      listLikeStatsForGuideIds: jest.fn(),
      removeLike: jest.fn(),
    };

    service = new ExerciseGuidesService(repository);
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
    expect(repository.listLikeStatsForGuideIds).toHaveBeenCalledWith({
      guideIds: BODY_PART_EXERCISE_GUIDES.map((guide) => guide.id),
      userKey: 'user-a',
    });
  });

  it('상세 조회에서 현재 사용자 likedByMe와 전체 likeCount를 함께 계산한다', async () => {
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
    await expect(
      service.getExerciseGuide('user-a', 'missing-guide'),
    ).rejects.toThrow(NotFoundException);
  });

  it('좋아요 설정은 추가 후 최신 합산 결과를 반환한다', async () => {
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
});
