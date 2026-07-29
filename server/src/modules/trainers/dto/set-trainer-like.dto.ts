import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';

export class SetTrainerLikeDto {
  @ApiProperty({
    example: true,
  })
  @Allow()
  liked!: boolean;
}
