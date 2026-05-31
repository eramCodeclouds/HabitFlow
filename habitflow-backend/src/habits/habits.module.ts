import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HabitsController } from './habits.controller';
import { HabitsService } from './habits.service';
import { Habit, HabitSchema } from './schemas/habit.schema';
import { AuthModule } from '../auth/auth.module';
import { HabitLog, HabitLogSchema } from '../habit-logs/schemas/habit-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Habit.name, schema: HabitSchema },
      { name: HabitLog.name, schema: HabitLogSchema },
    ]),
    AuthModule,
  ],
  controllers: [HabitsController],
  providers: [HabitsService],
  exports: [HabitsService], // Allows HabitLogsModule to use HabitsService
})
export class HabitsModule {}
