export type ExerciseGuideLikeStats = {
  guideId: string;
  likeCount: number;
  likedByMe: boolean;
};

export abstract class ExerciseGuidesRepositoryPort {
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
