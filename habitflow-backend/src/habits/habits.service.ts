import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Habit, HabitDocument } from './schemas/habit.schema';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { HabitLog, HabitLogDocument } from '../habit-logs/schemas/habit-log.schema';

export interface DeleteHabitResult {
  success: true;
  message: string;
}

@Injectable()
export class HabitsService {
  constructor(
    @InjectModel(Habit.name) private habitModel: Model<HabitDocument>,
    @InjectModel(HabitLog.name) private habitLogModel: Model<HabitLogDocument>,
  ) {}

  // Handles habit creation
  async create(createHabitDto: CreateHabitDto, userId: string): Promise<HabitDocument> {
    const createdHabit = new this.habitModel({ ...createHabitDto, userId });
    return createdHabit.save();
  }

  // Fetches all habits sorted by the newest first
  async findAll(userId: string): Promise<HabitDocument[]> {
    return this.habitModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  // Used by HabitLogsService to verify a habit exists before checking it off
  async findById(id: string, userId: string): Promise<HabitDocument> {
    const habit = await this.habitModel.findOne({ _id: id, userId }).exec();
    if (!habit) {
      throw new NotFoundException(`Habit with verification ID "${id}" does not exist.`);
    }
    return habit;
  }

  async updateHabit(
    id: string,
    updateHabitDto: UpdateHabitDto,
    userId: string,
  ): Promise<HabitDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid habit id.');
    }

    const habit = await this.habitModel.findById(id).exec();

    if (!habit) {
      throw new NotFoundException(`Habit with ID "${id}" does not exist.`);
    }

    if (habit.userId !== userId) {
      throw new ForbiddenException('You do not have permission to edit this habit.');
    }

    habit.title = updateHabitDto.title.trim();
    return habit.save();
  }

  async deleteHabit(id: string, userId: string): Promise<DeleteHabitResult> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid habit id.');
    }

    const habit = await this.habitModel.findById(id).exec();

    if (!habit) {
      throw new NotFoundException(`Habit with ID "${id}" does not exist.`);
    }

    if (habit.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this habit.');
    }

    const habitLogFilter = {
      habitId: new Types.ObjectId(id),
      userId,
    } as unknown as Parameters<Model<HabitLogDocument>['deleteMany']>[0];

    await Promise.all([
      this.habitModel.deleteOne({ _id: id, userId }).exec(),
      this.habitLogModel.deleteMany(habitLogFilter).exec(),
    ]);

    return {
      success: true,
      message: 'Habit deleted successfully',
    };
  }
}
