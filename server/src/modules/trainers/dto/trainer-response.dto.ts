import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TrainerConnectRequestStatus } from './trainer-connect-request-response.dto';

export class TrainerDto {
  @ApiProperty({
    example: 'trainer-seed-kim-minjun',
  })
  id!: string;

  @ApiProperty({
    example: '김민준',
  })
  name!: string;

  @ApiProperty({
    example: '강남 피트니스 클럽',
  })
  gymName!: string;

  @ApiProperty({
    example: 4.9,
  })
  rating!: number;

  @ApiProperty({
    example: '70,000원',
  })
  pricePerSession!: string;

  @ApiProperty({
    example: 8,
  })
  experienceYears!: number;

  @ApiProperty({
    example: ['근력 향상', '체형 교정'],
    type: [String],
  })
  specialties!: string[];

  @ApiProperty({
    example: ['등', '가슴', '어깨', '팔'],
    type: [String],
  })
  focusBodyParts!: string[];

  @ApiProperty({
    example: '선수 출신, 웨이트 트레이닝 8년 지도',
  })
  career!: string;

  @ApiProperty({
    example: ['NSCA-CPT', '선수 출신'],
    type: [String],
  })
  certifications!: string[];

  @ApiProperty({
    example: '근력 향상과 체형 교정을 함께 보는 정밀 코칭을 제공합니다.',
  })
  bio!: string;

  @ApiProperty({
    example: '기록과 자세를 같이 보면서 오래 갈 수 있는 강한 몸을 만듭니다.',
  })
  philosophy!: string;

  @ApiProperty({
    example: '#1B2A4A',
  })
  avatarColor!: string;

  @ApiProperty({
    example: 18,
  })
  memberCount!: number;

  @ApiProperty({
    example: '강남',
  })
  region!: string;

  @ApiProperty({
    example: true,
  })
  onlineAvailable!: boolean;

  @ApiProperty({
    example: false,
  })
  liked!: boolean;

  @ApiPropertyOptional({
    enum: TrainerConnectRequestStatus,
    example: TrainerConnectRequestStatus.Pending,
    nullable: true,
  })
  connectRequestStatus!: TrainerConnectRequestStatus | null;
}

export class RecommendedTrainerDto extends TrainerDto {
  @ApiProperty({
    example: 92,
  })
  matchScore!: number;

  @ApiProperty({
    example:
      '최근 등/팔 위주의 PT 기록과 잘 맞고, 체형 교정 니즈를 함께 볼 수 있는 트레이너예요.',
  })
  matchReason!: string;

  @ApiProperty({
    example: '체형 교정 적합',
  })
  highlightTag!: string;
}
