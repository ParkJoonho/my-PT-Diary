import { ApiProperty } from '@nestjs/swagger';

export class SetTrainerLikeDto {
  @ApiProperty({
    example: true,
  })
  liked!: boolean;
}
