import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import { ExerciseGuideCatalogType } from './exercise-guide-response.dto';

export class CreateAdminExerciseGuideDto {
  @ApiProperty({
    enum: ExerciseGuideCatalogType,
    example: ExerciseGuideCatalogType.BodyPart,
  })
  @Allow()
  catalogType!: ExerciseGuideCatalogType;

  @ApiProperty({ example: '가슴 상부 집중 루틴' })
  @Allow()
  title!: string;

  @ApiProperty({ example: '가슴' })
  @Allow()
  bodyPart!: string;

  @ApiProperty({ example: '벤치, 케이블' })
  @Allow()
  equipment!: string;

  @ApiProperty({ example: ['케이블', '바벨'], type: [String] })
  @Allow()
  equipmentTypes!: string[];

  @ApiProperty({ example: '12:30' })
  @Allow()
  duration!: string;

  @ApiProperty({ example: 3 })
  @Allow()
  initialLikeCount!: number;

  @ApiProperty({ example: 'https://www.youtube.com/embed/rT7DgCr-3pg' })
  @Allow()
  videoUrl!: string;

  @ApiProperty({
    example:
      '인클라인 벤치프레스와 케이블 플라이를 활용한 가슴 상부 강화 루틴입니다.',
  })
  @Allow()
  description!: string;

  @ApiPropertyOptional({ example: '가슴', nullable: true, type: String })
  @Allow()
  targetMuscles!: string | null;

  @ApiProperty({ example: 1 })
  @Allow()
  displayOrder!: number;
}
