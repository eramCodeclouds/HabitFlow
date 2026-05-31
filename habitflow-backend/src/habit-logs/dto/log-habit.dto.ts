import { IsMongoId, IsNotEmpty } from 'class-validator';

export class LogHabitDto {
  @IsMongoId({ message: 'A valid MongoDB ObjectId is required for habitId.' })
  @IsNotEmpty()
  habitId: string;
}