import { Injectable, NotFoundException } from '@nestjs/common';
import { ExerciseGuideDto } from './dto/exercise-guide-response.dto';
import { ListExerciseGuidesQueryDto } from './dto/list-exercise-guides-query.dto';
import {
  EXERCISE_GUIDE_CATALOG,
  EXERCISE_GUIDE_CATALOG_BY_ID,
  ExerciseGuideCatalogItem,
} from './exercise-guides.catalog';
import {
  ExerciseGuideLikeStats,
  ExerciseGuidesRepositoryPort,
} from './exercise-guides.repository.port';

@Injectable()
export class ExerciseGuidesService {
  constructor(
    private readonly exerciseGuidesRepository: ExerciseGuidesRepositoryPort,
  ) {}

  async listExerciseGuides(
    userKey: string,
    query: ListExerciseGuidesQueryDto,
  ): Promise<ExerciseGuideDto[]> {
    const guides = query.catalogType
      ? EXERCISE_GUIDE_CATALOG.filter(
          (guide) => guide.catalogType === query.catalogType,
        )
      : EXERCISE_GUIDE_CATALOG;
    const likeStats =
      await this.exerciseGuidesRepository.listLikeStatsForGuideIds({
        guideIds: guides.map((guide) => guide.id),
        userKey,
      });

    return this.mapGuides(guides, likeStats);
  }

  async getExerciseGuide(
    userKey: string,
    guideId: string,
  ): Promise<ExerciseGuideDto> {
    const guide = this.getCatalogItem(guideId);
    const likeStats =
      await this.exerciseGuidesRepository.listLikeStatsForGuideIds({
        guideIds: [guideId],
        userKey,
      });

    return this.mapGuide(guide, likeStats[0]);
  }

  async setExerciseGuideLike(
    userKey: string,
    guideId: string,
    liked: boolean,
  ): Promise<ExerciseGuideDto> {
    const guide = this.getCatalogItem(guideId);

    if (liked) {
      await this.exerciseGuidesRepository.addLike({ guideId, userKey });
    } else {
      await this.exerciseGuidesRepository.removeLike({ guideId, userKey });
    }

    const likeStats =
      await this.exerciseGuidesRepository.listLikeStatsForGuideIds({
        guideIds: [guideId],
        userKey,
      });

    return this.mapGuide(guide, likeStats[0]);
  }

  private getCatalogItem(guideId: string): ExerciseGuideCatalogItem {
    const guide = EXERCISE_GUIDE_CATALOG_BY_ID.get(guideId);

    if (!guide) {
      throw new NotFoundException('Exercise guide not found.');
    }

    return guide;
  }

  private mapGuides(
    guides: ExerciseGuideCatalogItem[],
    likeStats: ExerciseGuideLikeStats[],
  ) {
    const likeStatsByGuideId = new Map(
      likeStats.map((likeStat) => [likeStat.guideId, likeStat] as const),
    );

    return guides.map((guide) =>
      this.mapGuide(guide, likeStatsByGuideId.get(guide.id)),
    );
  }

  private mapGuide(
    guide: ExerciseGuideCatalogItem,
    likeStats?: ExerciseGuideLikeStats,
  ): ExerciseGuideDto {
    return {
      bodyPart: guide.bodyPart,
      catalogType: guide.catalogType,
      description: guide.description,
      duration: guide.duration,
      equipment: guide.equipment,
      equipmentTypes: guide.equipmentTypes,
      id: guide.id,
      likeCount: guide.initialLikeCount + (likeStats?.likeCount ?? 0),
      likedByMe: likeStats?.likedByMe ?? false,
      targetMuscles: guide.targetMuscles,
      title: guide.title,
      videoUrl: guide.videoUrl,
    };
  }
}
