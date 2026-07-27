import type {
  OutdoorWorkoutElevationPointDto,
  OutdoorWorkoutPlanDto,
} from 'shared/api/generated/models';

export type OutdoorWorkoutMode = 'walking' | 'hiking';
export type OutdoorWorkoutRadius = 1 | 2 | 3;

export type OutdoorWorkoutLocation = {
  isFallback: boolean;
  latitude: number;
  longitude: number;
};

export type OutdoorWorkoutPlanResult = {
  elevationPoints: OutdoorWorkoutElevationPointDto[];
  locationName: string;
  plan: OutdoorWorkoutPlanDto;
  workoutMode: OutdoorWorkoutMode;
};
