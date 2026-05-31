import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdateHabitDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Habit title must be at least 3 characters long.' })
  title: string;
}
