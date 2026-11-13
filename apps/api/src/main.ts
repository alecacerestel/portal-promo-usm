import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // La web llama a la API a través de su propio dominio (/api/*, ver next.config.ts),
  // así la cookie de sesión es del mismo origen y no hace falta CORS.
  app.use(cookieParser());
  // Las requests llegan desde el servidor de Next: se confía en su X-Forwarded-For para
  // conocer la IP real (la usa el límite de intentos de login). La API no debe exponerse directo.
  app.set('trust proxy', 'loopback, uniquelocal');
  await app.listen(process.env.API_PORT ?? 4000);
}
await bootstrap();
