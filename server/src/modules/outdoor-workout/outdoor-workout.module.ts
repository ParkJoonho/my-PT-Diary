import { Module } from '@nestjs/common';
import { OutdoorWorkoutPlanClientPort } from './outdoor-workout-plan-client.port';
import { OpenAiOutdoorWorkoutPlanClient } from './openai-outdoor-workout-plan.client';
import { OutdoorWorkoutController } from './outdoor-workout.controller';
import { OutdoorWorkoutService } from './outdoor-workout.service';

@Module({
  controllers: [OutdoorWorkoutController],
  providers: [
    OutdoorWorkoutService,
    {
      provide: OutdoorWorkoutPlanClientPort,
      useClass: OpenAiOutdoorWorkoutPlanClient,
    },
  ],
})
export class OutdoorWorkoutModule {}
