import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HabitLog, HabitLogDocument } from './schemas/habit-log.schema';
import { HabitsService } from '../habits/habits.service';
import { NotificationsService } from '../notifications/notifications.service';
import { LogHabitDto } from './dto/log-habit.dto';

@Injectable()
export class HabitLogsService {
  constructor(
    @InjectModel(HabitLog.name) private habitLogModel: Model<HabitLogDocument>,
    private readonly habitsService: HabitsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async logStatus(
    logHabitDto: LogHabitDto,
    status: 'completed' | 'missed',
    userId: string,
  ): Promise<HabitLogDocument> {
    // 1. Verify that the parent habit actually exists (throws 404 if not found)
    const habit = await this.habitsService.findById(logHabitDto.habitId, userId);

    // 2. Save the log to MongoDB Atlas
    const log = new this.habitLogModel({
      habitId: new Types.ObjectId(logHabitDto.habitId),
      userId,
      status,
    });
    const savedLog = await log.save();

    // 3. Dispatch data downstream to n8n asynchronously
    await this.notificationsService.dispatchWebhook(status, habit.title);

    return savedLog;
  }
}
