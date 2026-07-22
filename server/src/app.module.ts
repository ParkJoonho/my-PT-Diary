import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { validateEnv } from './config/env.schema';
import { DatabaseModule } from './database/database.module';
import { WeeklyTrackerModule } from './modules/weekly-tracker/weekly-tracker.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      validate: validateEnv,
    }),
    DatabaseModule,
    WeeklyTrackerModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
