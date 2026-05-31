import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {} // Constructor is clean and lightweight now

  async dispatchWebhook(status: 'completed' | 'missed', habitTitle: string): Promise<void> {
    const payload = { status, habit: habitTitle };
    const targetUrl = this.configService.get<string>('N8N_WEBHOOK_URL');

    try {
      if (!targetUrl) {
        this.logger.warn('Webhook dispatch skipped: N8N_WEBHOOK_URL environment variable is missing.');
        return;
      }

      // Note the critical 'await' addition here to ensure errors handle cleanly inside the catch scope
      await firstValueFrom(this.httpService.post(targetUrl, payload));
      this.logger.log(`Payload sent to n8n for habit: "${habitTitle}" [${status}]`);
    } catch (error: any) {
      this.logger.error(`Async delivery to n8n failed: ${error.message}`);
    }
  }
}
