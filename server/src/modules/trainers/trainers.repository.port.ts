import { TrainerConnectRequestStatus } from './dto/trainer-connect-request-response.dto';

export type TrainerRow = {
  id: string;
  name: string;
  gym_name: string;
  rating: number | string;
  price_per_session: string;
  experience_years: number;
  specialties: string[];
  focus_body_parts: string[];
  match_tags: string[];
  career: string;
  certifications: string[];
  bio: string;
  philosophy: string;
  avatar_color: string;
  base_member_count: number;
  region: string;
  online_available: boolean;
  liked: boolean;
  beginner_friendly: boolean;
  posture_friendly: boolean;
  rehab_friendly: boolean;
  display_order: number;
  connect_request_status: TrainerConnectRequestStatus | null;
  accepted_member_count: number;
};

export type TrainerConnectRequestRow = {
  id: string;
  user_key: string;
  trainer_id: string;
  trainer_name: string;
  status: TrainerConnectRequestStatus;
  message: string | null;
  created_at: string;
  updated_at: string;
};

export type TrainerProfileData = {
  conditionRecords: Array<{
    muscle_soreness: Array<{ label: string; score: number }>;
    summary: {
      averageSorenessScore: number | null;
      severeSorenessCount: number;
    };
  }>;
  ptLessons: Array<{
    body_parts: string[];
    summary: {
      totalVolumeKg: number;
    };
  }>;
  workoutActivityCount: number;
};

export abstract class TrainersRepositoryPort {
  abstract listApprovedTrainers(userKey: string): Promise<TrainerRow[]>;

  abstract findTrainerById(params: {
    trainerId: string;
    userKey: string;
  }): Promise<TrainerRow | null>;

  abstract createOrReturnConnectRequest(params: {
    trainerId: string;
    userKey: string;
    message: string | null;
  }): Promise<TrainerConnectRequestRow>;

  abstract setTrainerLike(params: {
    liked: boolean;
    trainerId: string;
    userKey: string;
  }): Promise<TrainerRow>;

  abstract listConnectRequests(userKey: string): Promise<
    TrainerConnectRequestRow[]
  >;

  abstract getTrainerProfileData(userKey: string): Promise<TrainerProfileData>;
}
