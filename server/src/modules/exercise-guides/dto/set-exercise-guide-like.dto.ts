import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetExerciseGuideLikeDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  liked!: boolean;
}
