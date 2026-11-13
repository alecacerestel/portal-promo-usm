import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  // El .env vive en la raíz del monorepo; en Docker las variables llegan por el entorno
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env' }), PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
