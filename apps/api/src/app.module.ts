import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';

@Module({
  imports: [
    // El .env vive en la raíz del monorepo; en Docker las variables llegan por el entorno
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env' }),
    // Límite general de requests por IP; el login tiene uno más estricto
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    PrismaModule,
    AuthModule,
    UsuariosModule,
  ],
  controllers: [AppController],
  // El ThrottlerGuard va antes que el AuthGuard (registrado en AuthModule)
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
