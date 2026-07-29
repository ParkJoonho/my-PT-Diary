import { Injectable } from '@nestjs/common';
import { CreateTrainerConnectRequestDto } from './dto/create-trainer-connect-request.dto';
import {
  RecommendedTrainerDto,
  TrainerDto,
} from './dto/trainer-response.dto';
import { TrainerConnectRequestDto } from './dto/trainer-connect-request-response.dto';
import {
  TrainerProfileData,
  TrainerRow,
  TrainersRepositoryPort,
} from './trainers.repository.port';

type UserTrainingProfile = {
  dominantBodyParts: string[];
  goalTags: string[];
  isBeginner: boolean;
  needsPosture: boolean;
  needsRehab: boolean;
  severeSorenessLabels: string[];
  totalActivityCount: number;
};

@Injectable()
export class TrainersService {
  constructor(
    private readonly trainersRepository: TrainersRepositoryPort,
  ) {}

  async listTrainers(userKey: string) {
    const trainers = await this.trainersRepository.listApprovedTrainers(userKey);

    return trainers.map((trainer) => this.mapTrainer(trainer));
  }

  async listRecommendedTrainers(userKey: string) {
    const [trainers, profileData] = await Promise.all([
      this.trainersRepository.listApprovedTrainers(userKey),
      this.trainersRepository.getTrainerProfileData(userKey),
    ]);
    const profile = this.buildUserTrainingProfile(profileData);

    return trainers
      .map((trainer) => this.mapRecommendedTrainer(trainer, profile))
      .sort((left, right) => right.matchScore - left.matchScore);
  }

  async createConnectRequest(
    userKey: string,
    trainerId: string,
    dto: CreateTrainerConnectRequestDto,
  ) {
    const record = await this.trainersRepository.createOrReturnConnectRequest({
      message: dto.message?.trim() ? dto.message.trim() : null,
      trainerId,
      userKey,
    });

    return this.mapConnectRequest(record);
  }

  async setTrainerLike(userKey: string, trainerId: string, liked: boolean) {
    const trainer = await this.trainersRepository.setTrainerLike({
      liked,
      trainerId,
      userKey,
    });

    return this.mapTrainer(trainer);
  }

  async listConnectRequests(userKey: string) {
    const records = await this.trainersRepository.listConnectRequests(userKey);

    return records.map((record) => this.mapConnectRequest(record));
  }

  private buildUserTrainingProfile(
    profileData: TrainerProfileData,
  ): UserTrainingProfile {
    const bodyPartCounts = new Map<string, number>();
    let ptActivityCount = 0;

    for (const lesson of profileData.ptLessons) {
      ptActivityCount += 1;

      for (const bodyPart of lesson.body_parts) {
        bodyPartCounts.set(bodyPart, (bodyPartCounts.get(bodyPart) ?? 0) + 1);
      }
    }

    const dominantBodyParts = [...bodyPartCounts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 3)
      .map(([bodyPart]) => bodyPart);

    const sorenessCounts = new Map<string, number>();
    let severeSorenessCount = 0;

    for (const record of profileData.conditionRecords) {
      severeSorenessCount += record.summary.severeSorenessCount ?? 0;

      for (const item of record.muscle_soreness) {
        if (item.score >= 3) {
          sorenessCounts.set(
            item.label,
            (sorenessCounts.get(item.label) ?? 0) + item.score,
          );
        }
      }
    }

    const severeSorenessLabels = [...sorenessCounts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 3)
      .map(([label]) => label);
    const totalActivityCount =
      ptActivityCount + profileData.workoutActivityCount;
    const needsRehab = severeSorenessCount > 0;
    const needsPosture =
      needsRehab ||
      severeSorenessLabels.some((label) =>
        ['허리', '승모근', '전삼각근', '측삼각근'].includes(label),
      ) ||
      dominantBodyParts.some((bodyPart) => ['코어', '복근'].includes(bodyPart));

    const goalTags = new Set<string>();

    if (dominantBodyParts.some((bodyPart) => ['코어', '복근'].includes(bodyPart))) {
      goalTags.add('core');
    }

    if (
      dominantBodyParts.some((bodyPart) =>
        ['등', '가슴', '어깨', '팔', '앞다리', '힙', '뒷다리'].includes(bodyPart),
      )
    ) {
      goalTags.add('strength');
    }

    if (
      dominantBodyParts.some((bodyPart) => ['등', '가슴', '어깨', '팔'].includes(bodyPart))
    ) {
      goalTags.add('hypertrophy');
    }

    if (
      dominantBodyParts.some((bodyPart) =>
        ['앞다리', '힙', '뒷다리', '전신'].includes(bodyPart),
      ) &&
      totalActivityCount >= 6
    ) {
      goalTags.add('performance');
    }

    if (needsRehab) {
      goalTags.add('rehab');
    }

    if (needsPosture) {
      goalTags.add('posture');
    }

    if (totalActivityCount < 4) {
      goalTags.add('beginner');
    }

    if (totalActivityCount < 2) {
      goalTags.add('conditioning');
    }

    if (!goalTags.size) {
      goalTags.add('strength');
    }

    return {
      dominantBodyParts,
      goalTags: [...goalTags],
      isBeginner: totalActivityCount < 4,
      needsPosture,
      needsRehab,
      severeSorenessLabels,
      totalActivityCount,
    };
  }

  private mapRecommendedTrainer(
    trainer: TrainerRow,
    profile: UserTrainingProfile,
  ): RecommendedTrainerDto {
    const normalizedRating =
      typeof trainer.rating === 'number'
        ? trainer.rating
        : Number.parseFloat(trainer.rating);
    const trainerBodyPartSet = new Set(trainer.focus_body_parts);
    const trainerTagSet = new Set(trainer.match_tags);
    const bodyPartOverlap = profile.dominantBodyParts.filter((bodyPart) =>
      trainerBodyPartSet.has(bodyPart),
    );
    const goalTagOverlap = profile.goalTags.filter((goalTag) =>
      trainerTagSet.has(goalTag),
    );

    let score = 20;

    score += Math.min(36, bodyPartOverlap.length * 18);
    score += Math.min(30, goalTagOverlap.length * 10);

    if (profile.isBeginner && trainer.beginner_friendly) {
      score += 10;
    }

    if (profile.needsRehab && trainer.rehab_friendly) {
      score += 12;
    }

    if (profile.needsPosture && trainer.posture_friendly) {
      score += 10;
    }

    score += Math.min(
      8,
      Math.round((normalizedRating - 4.5) * 10) +
        Math.floor((trainer.base_member_count + trainer.accepted_member_count) / 10),
    );

    const matchScore = Math.min(100, Math.max(1, Math.round(score)));

    return {
      ...this.mapTrainer(trainer),
      highlightTag: this.getHighlightTag(trainer, profile, bodyPartOverlap, goalTagOverlap),
      matchReason: this.buildMatchReason(
        trainer,
        profile,
        bodyPartOverlap,
        goalTagOverlap,
      ),
      matchScore,
    };
  }

  private buildMatchReason(
    trainer: TrainerRow,
    profile: UserTrainingProfile,
    bodyPartOverlap: string[],
    goalTagOverlap: string[],
  ) {
    const reasons: string[] = [];

    if (bodyPartOverlap.length > 0) {
      reasons.push(
        `최근 ${bodyPartOverlap.join(', ')} 위주의 PT 기록과 잘 맞아요.`,
      );
    }

    if (goalTagOverlap.includes('rehab')) {
      reasons.push(
        '최근 컨디션 기록상 회복과 통증 관리 니즈를 함께 볼 수 있는 트레이너예요.',
      );
    } else if (goalTagOverlap.includes('posture')) {
      reasons.push(
        '자세 교정과 움직임 정렬을 같이 잡아가기 좋은 매칭이에요.',
      );
    } else if (goalTagOverlap.includes('core')) {
      reasons.push('코어 안정화와 균형 회복에 강점이 있어요.');
    } else if (goalTagOverlap.includes('performance')) {
      reasons.push('하체 퍼포먼스와 운동 강도 향상 방향에 잘 맞아요.');
    } else if (goalTagOverlap.includes('strength')) {
      reasons.push('근력 향상과 운동 볼륨 확장 방향에 잘 맞는 코치예요.');
    }

    if (profile.isBeginner && trainer.beginner_friendly) {
      reasons.push('초반 운동 습관과 기본 자세를 안정적으로 잡기 좋아요.');
    }

    if (!reasons.length) {
      reasons.push(
        `${trainer.specialties.join(', ')} 중심으로 현재 기록 흐름과 무난하게 잘 맞는 트레이너예요.`,
      );
    }

    return reasons.slice(0, 2).join(' ');
  }

  private getHighlightTag(
    trainer: TrainerRow,
    profile: UserTrainingProfile,
    bodyPartOverlap: string[],
    goalTagOverlap: string[],
  ) {
    if (goalTagOverlap.includes('rehab') && trainer.rehab_friendly) {
      return '재활/회복 적합';
    }

    if (goalTagOverlap.includes('posture') && trainer.posture_friendly) {
      return '체형 교정 적합';
    }

    if (goalTagOverlap.includes('core')) {
      return '코어 강화 추천';
    }

    if (goalTagOverlap.includes('performance')) {
      return '퍼포먼스 강화';
    }

    if (profile.isBeginner && trainer.beginner_friendly) {
      return '입문자 추천';
    }

    if (bodyPartOverlap.length > 0) {
      return `${bodyPartOverlap[0]} 집중 매칭`;
    }

    return trainer.specialties[0] ?? '추천 매칭';
  }

  private mapTrainer(trainer: TrainerRow): TrainerDto {
    const normalizedRating =
      typeof trainer.rating === 'number'
        ? trainer.rating
        : Number.parseFloat(trainer.rating);

    return {
      avatarColor: trainer.avatar_color,
      bio: trainer.bio,
      career: trainer.career,
      certifications: trainer.certifications,
      connectRequestStatus: trainer.connect_request_status,
      experienceYears: trainer.experience_years,
      focusBodyParts: trainer.focus_body_parts,
      gymName: trainer.gym_name,
      id: trainer.id,
      liked: trainer.liked,
      memberCount: trainer.base_member_count + trainer.accepted_member_count,
      name: trainer.name,
      onlineAvailable: trainer.online_available,
      philosophy: trainer.philosophy,
      pricePerSession: trainer.price_per_session,
      rating: Number.isFinite(normalizedRating) ? normalizedRating : 0,
      region: trainer.region,
      specialties: trainer.specialties,
    };
  }

  private mapConnectRequest(
    record: Awaited<ReturnType<TrainersRepositoryPort['listConnectRequests']>>[number],
  ): TrainerConnectRequestDto {
    return {
      createdAt: record.created_at,
      id: record.id,
      message: record.message,
      status: record.status,
      trainerId: record.trainer_id,
      trainerName: record.trainer_name,
      updatedAt: record.updated_at,
    };
  }
}
