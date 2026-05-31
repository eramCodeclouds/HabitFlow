import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HabitsModule } from './habits/habits.module';
import { HabitLogsModule } from './habit-logs/habit-logs.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Initialize the global configuration engine
    ConfigModule.forRoot({
      isGlobal: true, // Makes configuration available everywhere without re-importing
    }),
    // Connect to MongoDB Atlas dynamically using the .env variable
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    HabitsModule,
    HabitLogsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
