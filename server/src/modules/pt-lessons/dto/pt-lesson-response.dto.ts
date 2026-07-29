import { ApiProperty } from '@nestjs/swagger';

export class PtLessonExerciseSetDto {
  @ApiProperty({
    example: 'c03e39e3-fb2f-48d4-a883-c9d5ca1f90b7',
  })
  id!: string;

  @ApiProperty({
    example: 40,
  })
  weightKg!: number;

  @ApiProperty({
    example: 10,
  })
  reps!: number;
}

export class PtLessonExerciseDto {
  @ApiProperty({
    example: '랫풀다운',
  })
  name!: string;

  @ApiProperty({
    type: [PtLessonExerciseSetDto],
  })
  sets!: PtLessonExerciseSetDto[];

  @ApiProperty({
    example: '60초',
  })
  restTime!: string;

  @ApiProperty({
    example: '2',
  })
  rir!: string;

  @ApiProperty({
    example: 1160,
  })
  volumeKg!: number;

  @ApiProperty({
    example: 88.2,
  })
  lbWeight!: number;

  @ApiProperty({
    example: 57.3,
  })
  estimatedOneRepMaxKg!: number;

  @ApiProperty({
    example: 40,
  })
  maxWeightKg!: number;
}

export class PtLessonSummaryDto {
  @ApiProperty({
    example: 2,
  })
  exerciseCount!: number;

  @ApiProperty({
    example: 6,
  })
  setCount!: number;

  @ApiProperty({
    example: 2240,
  })
  totalVolumeKg!: number;
}

export class PtLessonDto {
  @ApiProperty({
    example: '5c5ae75d-e587-4a34-90b7-86f0872e1fdd',
  })
  id!: string;

  @ApiProperty({
    example: '2026-07-29',
  })
  date!: string;

  @ApiProperty({
    example: '수',
  })
  dayOfWeek!: string;

  @ApiProperty({
    example: 18,
  })
  sessionNumber!: number;

  @ApiProperty({
    example: ['등', '팔'],
    type: [String],
  })
  bodyParts!: string[];

  @ApiProperty({
    example: ['머신', '프리웨이트'],
    type: [String],
  })
  equipment!: string[];

  @ApiProperty({
    example: '밴드 풀어파트 2세트, 흉추 회전 스트레칭',
  })
  warmUp!: string;

  @ApiProperty({
    type: [PtLessonExerciseDto],
  })
  exercises!: PtLessonExerciseDto[];

  @ApiProperty({
    example: '등 수축 감각이 안정적으로 잡혔어요.',
  })
  comment!: string;

  @ApiProperty({
    type: PtLessonSummaryDto,
  })
  summary!: PtLessonSummaryDto;

  @ApiProperty({
    example: 1785326400000,
  })
  createdAt!: number;
}
