import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ExerciseGuideCatalogType } from './exercise-guide-response.dto';

export class ListExerciseGuidesQueryDto {
  @ApiPropertyOptional({
    enum: ExerciseGuideCatalogType,
    example: ExerciseGuideCatalogType.BodyPart,
  })
  @IsOptional()
  @IsEnum(ExerciseGuideCatalogType)
  catalogType?: ExerciseGuideCatalogType;
}
