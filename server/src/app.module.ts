import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { validateEnv } from './config/env.schema';
import { DatabaseModule } from './database/database.module';
import { ConditionRecordsModule } from './modules/condition-records/condition-records.module';
import { ExerciseGuidesModule } from './modules/exercise-guides/exercise-guides.module';
import { WeeklyTrackerModule } from './modules/weekly-tracker/weekly-tracker.module';
import { WorkoutRecordsModule } from './modules/workout-records/workout-records.module';
import { WorkoutReportsModule } from './modules/workout-reports/workout-reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      validate: validateEnv,
    }),
    DatabaseModule,
    WeeklyTrackerModule,
    WorkoutRecordsModule,
    ConditionRecordsModule,
    WorkoutReportsModule,
    ExerciseGuidesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
