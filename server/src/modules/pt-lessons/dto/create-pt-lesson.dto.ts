import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import { PtLessonExerciseDto } from './pt-lesson-response.dto';

export class CreatePtLessonDto {
  @ApiProperty({
    example: '2026-07-29',
  })
  @Allow()
  date!: string;

  @ApiProperty({
    example: 18,
  })
  @Allow()
  sessionNumber!: number;

  @ApiProperty({
    example: ['등', '팔'],
    type: [String],
  })
  @Allow()
  bodyParts!: string[];

  @ApiProperty({
    example: ['머신', '프리웨이트'],
    type: [String],
  })
  @Allow()
  equipment!: string[];

  @ApiProperty({
    example: '밴드 풀어파트 2세트',
  })
  @Allow()
  warmUp!: string;

  @ApiProperty({
    type: [PtLessonExerciseDto],
  })
  @Allow()
  exercises!: PtLessonExerciseDto[];

  @ApiProperty({
    example: '등 수축 감각이 잘 잡혔어요.',
  })
  @Allow()
  comment!: string;
}
