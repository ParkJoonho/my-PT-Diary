import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AdminExerciseGuideDto } from './dto/admin-exercise-guide.dto';
import { CreateAdminExerciseGuideDto } from './dto/create-admin-exercise-guide.dto';
import { ExerciseGuideDto } from './dto/exercise-guide-response.dto';
import { ListExerciseGuidesQueryDto } from './dto/list-exercise-guides-query.dto';
import { UpdateAdminExerciseGuideDto } from './dto/update-admin-exercise-guide.dto';
import {
  ExerciseGuideCatalogRecord,
  ExerciseGuideCatalogWriteModel,
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
    const guides = await this.exerciseGuidesRepository.listGuides({
      catalogType: query.catalogType,
    });
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
    const guide = await this.getCatalogItem(guideId);
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
    const guide = await this.getCatalogItem(guideId);

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

  async listAdminExerciseGuides(
    query: ListExerciseGuidesQueryDto,
  ): Promise<AdminExerciseGuideDto[]> {
    const guides = await this.exerciseGuidesRepository.listGuides({
      catalogType: query.catalogType,
    });

    return guides.map((guide) => this.mapAdminGuide(guide));
  }

  async getAdminExerciseGuide(guideId: string): Promise<AdminExerciseGuideDto> {
    const guide = await this.getCatalogItem(guideId);

    return this.mapAdminGuide(guide);
  }

  async createAdminExerciseGuide(
    dto: CreateAdminExerciseGuideDto,
  ): Promise<AdminExerciseGuideDto> {
    const guideId = `guide_${randomUUID()}`;
    const createdGuide = await this.exerciseGuidesRepository.createGuide({
      guideId,
      guide: this.toWriteModel(dto),
    });

    return this.mapAdminGuide(createdGuide);
  }

  async updateAdminExerciseGuide(
    guideId: string,
    dto: UpdateAdminExerciseGuideDto,
  ): Promise<AdminExerciseGuideDto> {
    const updatedGuide = await this.exerciseGuidesRepository.updateGuide({
      guideId,
      guide: this.toWriteModel(dto),
    });

    if (!updatedGuide) {
      throw new NotFoundException('Exercise guide not found.');
    }

    return this.mapAdminGuide(updatedGuide);
  }

  async deleteAdminExerciseGuide(guideId: string): Promise<void> {
    const deleted = await this.exerciseGuidesRepository.deleteGuide(guideId);

    if (!deleted) {
      throw new NotFoundException('Exercise guide not found.');
    }
  }

  private async getCatalogItem(
    guideId: string,
  ): Promise<ExerciseGuideCatalogRecord> {
    const guide = await this.exerciseGuidesRepository.getGuideById(guideId);

    if (!guide) {
      throw new NotFoundException('Exercise guide not found.');
    }

    return guide;
  }

  private mapGuides(
    guides: ExerciseGuideCatalogRecord[],
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
    guide: ExerciseGuideCatalogRecord,
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

  private mapAdminGuide(guide: ExerciseGuideCatalogRecord): AdminExerciseGuideDto {
    return {
      bodyPart: guide.bodyPart,
      catalogType: guide.catalogType,
      createdAt: guide.createdAt,
      description: guide.description,
      displayOrder: guide.displayOrder,
      duration: guide.duration,
      equipment: guide.equipment,
      equipmentTypes: guide.equipmentTypes,
      id: guide.id,
      initialLikeCount: guide.initialLikeCount,
      targetMuscles: guide.targetMuscles,
      title: guide.title,
      updatedAt: guide.updatedAt,
      videoUrl: guide.videoUrl,
    };
  }

  private toWriteModel(
    dto: CreateAdminExerciseGuideDto | UpdateAdminExerciseGuideDto,
  ): ExerciseGuideCatalogWriteModel {
    return {
      bodyPart: dto.bodyPart,
      catalogType: dto.catalogType,
      description: dto.description,
      displayOrder: dto.displayOrder,
      duration: dto.duration,
      equipment: dto.equipment,
      equipmentTypes: dto.equipmentTypes,
      initialLikeCount: dto.initialLikeCount,
      targetMuscles: dto.targetMuscles,
      title: dto.title,
      videoUrl: dto.videoUrl,
    };
  }
}
