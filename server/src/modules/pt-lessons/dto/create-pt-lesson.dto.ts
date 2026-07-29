import { ApiProperty } from '@nestjs/swagger';
import { PtLessonExerciseDto } from './pt-lesson-response.dto';

export class CreatePtLessonDto {
  @ApiProperty({
    example: '2026-07-29',
  })
  date!: string;

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
    example: '밴드 풀어파트 2세트',
  })
  warmUp!: string;

  @ApiProperty({
    type: [PtLessonExerciseDto],
  })
  exercises!: PtLessonExerciseDto[];

  @ApiProperty({
    example: '등 수축 감각이 잘 잡혔어요.',
  })
  comment!: string;
}
