import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateHabitDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Habit title must be at least 3 characters long.' })
  title: string;
}