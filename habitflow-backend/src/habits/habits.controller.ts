import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { HabitsService } from './habits.service';
import type { DeleteHabitResult } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthUser } from '../auth/types/auth-user';

@Controller('habits')
@UseGuards(JwtAuthGuard)
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  // Endpoint: POST http://localhost:3000/habits
  @Post()
  create(@Body() createHabitDto: CreateHabitDto, @CurrentUser() user: AuthUser) {
    return this.habitsService.create(createHabitDto, user.userId);
  }

  // Endpoint: GET http://localhost:3000/habits
  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.habitsService.findAll(user.userId);
  }

  // Endpoint: PATCH http://localhost:3000/habits/:id
  @Patch(':id')
  update(
    @Param('id') habitId: string,
    @Body() updateHabitDto: UpdateHabitDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.habitsService.updateHabit(habitId, updateHabitDto, user.userId);
  }

  // Endpoint: DELETE http://localhost:3000/habits/:id
  @Delete(':id')
  delete(@Param('id') habitId: string, @CurrentUser() user: AuthUser): Promise<DeleteHabitResult> {
    return this.habitsService.deleteHabit(habitId, user.userId);
  }
}
