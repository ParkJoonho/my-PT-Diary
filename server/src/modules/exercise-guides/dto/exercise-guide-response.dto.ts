import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ExerciseGuideCatalogType {
  BodyPart = 'body_part',
  Equipment = 'equipment',
}

export class ExerciseGuideDto {
  @ApiProperty({ example: 'r1' })
  id!: string;

  @ApiProperty({
    enum: ExerciseGuideCatalogType,
    example: ExerciseGuideCatalogType.BodyPart,
  })
  catalogType!: ExerciseGuideCatalogType;

  @ApiProperty({ example: '가슴 상부 집중 루틴' })
  title!: string;

  @ApiProperty({ example: '가슴' })
  bodyPart!: string;

  @ApiProperty({ example: '벤치, 케이블' })
  equipment!: string;

  @ApiProperty({ example: ['케이블', '바벨'], type: [String] })
  equipmentTypes!: string[];

  @ApiProperty({ example: '12:30' })
  duration!: string;

  @ApiProperty({ example: 'https://www.youtube.com/embed/rT7DgCr-3pg' })
  videoUrl!: string;

  @ApiProperty({
    example:
      '인클라인 벤치프레스와 케이블 플라이를 활용한 가슴 상부 강화 루틴입니다.',
  })
  description!: string;

  @ApiPropertyOptional({ example: '가슴', nullable: true, type: String })
  targetMuscles!: string | null;

  @ApiProperty({ example: 5 })
  likeCount!: number;

  @ApiProperty({ example: false })
  likedByMe!: boolean;
}
