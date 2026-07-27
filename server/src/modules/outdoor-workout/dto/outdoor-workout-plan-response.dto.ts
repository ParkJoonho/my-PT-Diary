import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OutdoorWorkoutCourseWaypointDto {
  @ApiProperty({ example: 1 })
  order!: number;

  @ApiProperty({ example: 37.5665 })
  latitude!: number;

  @ApiProperty({ example: 126.978 })
  longitude!: number;

  @ApiProperty({ example: '출발지' })
  label!: string;

  @ApiProperty({ example: 38 })
  elevation!: number;

  @ApiProperty({ example: '북동쪽으로 직진해요' })
  direction!: string;

  @ApiProperty({ example: '완만한 오르막 3%' })
  slope!: string;
}

export class OutdoorWorkoutRouteSegmentDto {
  @ApiProperty({ example: '출발 구간' })
  name!: string;

  @ApiProperty({ example: '0.4' })
  distance!: string;

  @ApiProperty({ example: '+12m' })
  elevationChange!: string;

  @ApiProperty({ example: '쉬움' })
  difficulty!: string;

  @ApiPropertyOptional({ example: 1 })
  startWaypoint?: number;

  @ApiPropertyOptional({ example: 2 })
  endWaypoint?: number;

  @ApiPropertyOptional({
    example: '출발지에서 공원 방향으로 직진해요',
  })
  direction?: string;

  @ApiPropertyOptional({ example: '산책로' })
  terrainType?: string;

  @ApiPropertyOptional({ example: '평균 경사 2%' })
  slopeInfo?: string;

  @ApiProperty({
    example: '코로 3초 들이쉬고 입으로 5초 내쉬어요.',
  })
  breathingTip!: string;

  @ApiProperty({
    example: '호흡이 거칠어지면 30초 정도 속도를 낮춰요.',
  })
  restRecommendation!: string;

  @ApiPropertyOptional({
    example: '어깨를 펴고 팔을 자연스럽게 흔들어요.',
  })
  bodyTypeExercise?: string;
}

export class OutdoorWorkoutBodyTypeExerciseDto {
  @ApiProperty({ example: '어깨 열기 스트레칭' })
  name!: string;

  @ApiProperty({
    example: '걷기 전후로 가슴과 어깨 앞쪽을 충분히 열어줘요.',
  })
  description!: string;

  @ApiProperty({ example: '어깨' })
  targetArea!: string;

  @ApiProperty({ example: '10회' })
  duration!: string;

  @ApiProperty({
    example: '상체 말림을 줄이는 데 도움을 줘요.',
  })
  benefit!: string;
}

export class OutdoorWorkoutPlanDto {
  @ApiProperty({ example: '걷기/러닝 코스' })
  routeType!: string;

  @ApiProperty({ example: '1.4' })
  totalDistance!: string;

  @ApiProperty({ example: '약 22분' })
  estimatedTime!: string;

  @ApiProperty({ example: '약 110kcal' })
  estimatedCalories!: string;

  @ApiProperty({ example: '약 24m' })
  elevationGain!: string;

  @ApiProperty({ example: '보통' })
  difficulty!: string;

  @ApiProperty({
    example:
      '평탄한 구간과 완만한 오르막이 섞여 있어 가볍게 페이스를 조절하며 진행하기 좋아요.',
  })
  summary!: string;

  @ApiPropertyOptional({
    type: [OutdoorWorkoutCourseWaypointDto],
  })
  courseWaypoints?: OutdoorWorkoutCourseWaypointDto[];

  @ApiProperty({
    type: [OutdoorWorkoutRouteSegmentDto],
  })
  segments!: OutdoorWorkoutRouteSegmentDto[];

  @ApiProperty({
    type: [String],
    example: ['운동 전 물을 충분히 마셔요.'],
  })
  generalTips!: string[];

  @ApiPropertyOptional({
    type: [OutdoorWorkoutBodyTypeExerciseDto],
  })
  bodyTypeExercises?: OutdoorWorkoutBodyTypeExerciseDto[];

  @ApiPropertyOptional({
    example:
      '어깨가 앞으로 말리는 경향이 있으면 팔을 뒤로 여는 의식을 유지해요.',
  })
  personalizedNote?: string;
}
