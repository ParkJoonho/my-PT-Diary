import { ApiPropertyOptional } from '@nestjs/swagger';
import { Allow } from 'class-validator';

export class CreateTrainerConnectRequestDto {
  @ApiPropertyOptional({
    example: '등/어깨 위주 PT를 받고 싶어요.',
  })
  @Allow()
  message?: string;
}
