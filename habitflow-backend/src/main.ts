import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const frontendUrl = configService.get<string>('FRONTEND_URL');
  const isAllowedDevOrigin = (origin?: string) => {
    if (!origin) return true;

    try {
      const url = new URL(origin);
      const isVitePort = Number(url.port) >= 5173 && Number(url.port) <= 5199;
      const isLocalHost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
      const isPrivateIp =
        /^10\.\d+\.\d+\.\d+$/.test(url.hostname) ||
        /^192\.168\.\d+\.\d+$/.test(url.hostname) ||
        /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/.test(url.hostname);

      return url.protocol === 'http:' && isVitePort && (isLocalHost || isPrivateIp);
    } catch {
      return false;
    }
  };

  app.enableCors({
    origin: (origin, callback) => {
      if (origin && frontendUrl && origin === frontendUrl) {
        callback(null, true);
        return;
      }

      if (isAllowedDevOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`🚀 HabitFlow Backend Core running on http://localhost:${port}`);
}
bootstrap();
