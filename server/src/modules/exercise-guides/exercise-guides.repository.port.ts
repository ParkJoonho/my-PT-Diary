import { ExerciseGuideCatalogType } from './dto/exercise-guide-response.dto';

export type ExerciseGuideLikeStats = {
  guideId: string;
  likeCount: number;
  likedByMe: boolean;
};

export type ExerciseGuideCatalogRecord = {
  id: string;
  catalogType: ExerciseGuideCatalogType;
  title: string;
  bodyPart: string;
  equipment: string;
  equipmentTypes: string[];
  duration: string;
  initialLikeCount: number;
  videoUrl: string;
  description: string;
  targetMuscles: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ExerciseGuideCatalogWriteModel = Omit<
  ExerciseGuideCatalogRecord,
  'id' | 'createdAt' | 'updatedAt'
>;

export abstract class ExerciseGuidesRepositoryPort {
  abstract listGuides(params?: {
    catalogType?: ExerciseGuideCatalogType;
  }): Promise<ExerciseGuideCatalogRecord[]>;

  abstract getGuideById(
    guideId: string,
  ): Promise<ExerciseGuideCatalogRecord | null>;

  abstract createGuide(params: {
    guideId: string;
    guide: ExerciseGuideCatalogWriteModel;
  }): Promise<ExerciseGuideCatalogRecord>;

  abstract updateGuide(params: {
    guideId: string;
    guide: ExerciseGuideCatalogWriteModel;
  }): Promise<ExerciseGuideCatalogRecord | null>;

  abstract deleteGuide(guideId: string): Promise<boolean>;

  abstract listLikeStatsForGuideIds(params: {
    guideIds: string[];
    userKey: string;
  }): Promise<ExerciseGuideLikeStats[]>;

  abstract addLike(params: { guideId: string; userKey: string }): Promise<void>;

  abstract removeLike(params: {
    guideId: string;
    userKey: string;
  }): Promise<void>;
}
