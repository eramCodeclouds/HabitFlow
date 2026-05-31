import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; // Ensure this is imported
import { NotificationsService } from './notifications.service';

@Module({
  // Register HttpModule here so NestJS can resolve HttpService inside this module context
  imports: [HttpModule],
  providers: [NotificationsService],
  exports: [NotificationsService], 
})
export class NotificationsModule {}