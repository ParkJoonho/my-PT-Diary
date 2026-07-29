import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { TrainersController } from './trainers.controller';
import { TrainersRepositoryPort } from './trainers.repository.port';
import { TrainersRepository } from './trainers.repository';
import { TrainersService } from './trainers.service';

@Module({
  controllers: [TrainersController],
  imports: [DatabaseModule],
  providers: [
    TrainersService,
    {
      provide: TrainersRepositoryPort,
      useClass: TrainersRepository,
    },
  ],
})
export class TrainersModule {}
