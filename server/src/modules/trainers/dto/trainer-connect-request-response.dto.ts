import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TrainerConnectRequestStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Rejected = 'rejected',
}

export class TrainerConnectRequestDto {
  @ApiProperty({
    example: '6952028b-c6a4-4f50-97d9-9971c4e4574e',
  })
  id!: string;

  @ApiProperty({
    example: 'trainer-seed-kim-minjun',
  })
  trainerId!: string;

  @ApiProperty({
    example: '김민준',
  })
  trainerName!: string;

  @ApiProperty({
    enum: TrainerConnectRequestStatus,
    example: TrainerConnectRequestStatus.Pending,
  })
  status!: TrainerConnectRequestStatus;

  @ApiPropertyOptional({
    example: '등/어깨 위주 PT를 받고 싶어요.',
  })
  message!: string | null;

  @ApiProperty({
    example: '2026-07-29T11:00:00.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    example: '2026-07-29T11:00:00.000Z',
  })
  updatedAt!: string;
}
