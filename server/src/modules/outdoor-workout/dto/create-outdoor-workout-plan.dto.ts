import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Allow } from 'class-validator';

export class OutdoorWorkoutElevationPointDto {
  @ApiProperty({ example: 0 })
  @Allow()
  point!: number;

  @ApiProperty({ example: 37.5665 })
  @Allow()
  lat!: number;

  @ApiProperty({ example: 126.978 })
  @Allow()
  lng!: number;

  @ApiProperty({ example: 38 })
  @Allow()
  elevation!: number;
}

export class OutdoorWorkoutBodyAnalysisPayloadDto {
  @ApiPropertyOptional({
    example: {
      bodyType: '라운드 숄더',
      bodyTypeDescription: '상체 전방 말림 경향',
    },
  })
  @Allow()
  qualitativeData?: unknown;

  @ApiPropertyOptional({
    example: {
      overallAlignment: 3,
      shoulderBalance: 2,
      hipBalance: 3,
    },
  })
  @Allow()
  quantitativeData?: unknown;

  @ApiPropertyOptional({
    example: {
      upperBody: {
        shoulderWidth: { value: '좁음' },
        spineAlignment: { value: '전방 말림' },
      },
    },
  })
  @Allow()
  rawResult?: unknown;
}

export class CreateOutdoorWorkoutPlanDto {
  @ApiProperty({ example: 37.5665 })
  @Allow()
  startLat!: number;

  @ApiProperty({ example: 126.978 })
  @Allow()
  startLng!: number;

  @ApiProperty({ example: 37.5712 })
  @Allow()
  endLat!: number;

  @ApiProperty({ example: 126.9831 })
  @Allow()
  endLng!: number;

  @ApiProperty({
    example: 1.24,
    description: 'Straight-line distance currently passed from the client.',
  })
  @Allow()
  distanceKm!: number;

  @ApiProperty({
    enum: ['walking', 'hiking'],
    example: 'walking',
  })
  @Allow()
  mode!: 'walking' | 'hiking';

  @ApiProperty({
    enum: [1, 2, 3],
    example: 1,
  })
  @Allow()
  radiusKm!: 1 | 2 | 3;

  @ApiPropertyOptional({
    type: [OutdoorWorkoutElevationPointDto],
  })
  @Allow()
  elevationData?: OutdoorWorkoutElevationPointDto[];

  @ApiPropertyOptional({
    type: OutdoorWorkoutBodyAnalysisPayloadDto,
  })
  @Allow()
  bodyAnalysis?: OutdoorWorkoutBodyAnalysisPayloadDto;
}
