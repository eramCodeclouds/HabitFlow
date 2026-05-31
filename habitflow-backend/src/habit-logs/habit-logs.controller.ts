import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { HabitLogsService } from './habit-logs.service';
import { LogHabitDto } from './dto/log-habit.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthUser } from '../auth/types/auth-user';

@Controller('habits')
@UseGuards(JwtAuthGuard)
export class HabitLogsController {
  constructor(private readonly habitLogsService: HabitLogsService) {}

  @Post('complete')
  async logComplete(@Body() logHabitDto: LogHabitDto, @CurrentUser() user: AuthUser) {
    return this.habitLogsService.logStatus(logHabitDto, 'completed', user.userId);
  }

  @Post('missed')
  async logMissed(@Body() logHabitDto: LogHabitDto, @CurrentUser() user: AuthUser) {
    return this.habitLogsService.logStatus(logHabitDto, 'missed', user.userId);
  }
}
