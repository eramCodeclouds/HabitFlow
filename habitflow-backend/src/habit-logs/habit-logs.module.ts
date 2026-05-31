import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HabitLogsController } from './habit-logs.controller';
import { HabitLogsService } from './habit-logs.service';
import { HabitLog, HabitLogSchema } from './schemas/habit-log.schema';
import { HabitsModule } from '../habits/habits.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: HabitLog.name, schema: HabitLogSchema }]),
    HabitsModule,
    NotificationsModule,
    AuthModule,
  ],
  controllers: [HabitLogsController],
  providers: [HabitLogsService],
})
export class HabitLogsModule {}
