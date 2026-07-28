import { ApiProperty } from '@nestjs/swagger';

class AnalysisRecordBodyTypeChangeDto {
  @ApiProperty({ example: 'V' })
  from!: string;

  @ApiProperty({ example: 'V' })
  to!: string;

  @ApiProperty({
    example: '체형 유형은 유지되지만 어깨 안정성과 골반 밸런스가 개선됐어요.',
  })
  note!: string;
}

class AnalysisRecordPostureChangeDto {
  @ApiProperty({ example: '어깨 균형' })
  area!: string;

  @ApiProperty({ example: 2 })
  before!: number;

  @ApiProperty({ example: 4 })
  after!: number;

  @ApiProperty({ example: '개선' })
  change!: string;

  @ApiProperty({
    example: '좌우 높이 차가 줄고 견갑 안정성이 조금 더 좋아졌어요.',
  })
  note!: string;
}

class AnalysisRecordQuantitativeChangeDto {
  @ApiProperty({ example: 'armToHeight' })
  metric!: string;

  @ApiProperty({ example: '0.49' })
  before!: string;

  @ApiProperty({ example: '0.51' })
  after!: string;

  @ApiProperty({ example: '+4.1%' })
  changePercent!: string;
}

class ComparedAnalysisRecordMetaDto {
  @ApiProperty({ example: 'record_old' })
  id!: string;

  @ApiProperty({ example: 'body' })
  analysisType!: string;

  @ApiProperty({ example: '2026-07-27T09:00:00.000Z' })
  analyzedAt!: string;
}

export class CompareAnalysisRecordsResponseDto {
  @ApiProperty({
    example: '전반적인 자세 정렬과 상하체 균형이 이전보다 안정적으로 보이는 편이에요.',
  })
  overallChange!: string;

  @ApiProperty({
    type: [String],
    example: ['어깨 균형이 좋아졌어요.', '골반 좌우 흔들림이 줄었어요.'],
  })
  improvements!: string[];

  @ApiProperty({
    type: [String],
    example: [],
  })
  declines!: string[];

  @ApiProperty({
    type: AnalysisRecordBodyTypeChangeDto,
  })
  bodyTypeChange!: AnalysisRecordBodyTypeChangeDto;

  @ApiProperty({
    type: [AnalysisRecordPostureChangeDto],
  })
  postureChanges!: AnalysisRecordPostureChangeDto[];

  @ApiProperty({
    type: [AnalysisRecordQuantitativeChangeDto],
  })
  quantitativeChanges!: AnalysisRecordQuantitativeChangeDto[];

  @ApiProperty({
    type: [String],
    example: ['흉추 가동성 운동을 계속 유지해요.', '골반 안정화 운동을 추가해요.'],
  })
  recommendations!: string[];

  @ApiProperty({
    example: '지금 흐름이면 자세 안정성이 더 좋아질 가능성이 충분해 보여요.',
  })
  motivationalNote!: string;

  @ApiProperty({
    type: ComparedAnalysisRecordMetaDto,
  })
  olderRecord!: ComparedAnalysisRecordMetaDto;

  @ApiProperty({
    type: ComparedAnalysisRecordMetaDto,
  })
  newerRecord!: ComparedAnalysisRecordMetaDto;
}
