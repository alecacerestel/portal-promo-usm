import { Body, Controller, Get, HttpCode, Post, Res } from '@nestjs/common';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import {
  cambiarPasswordSchema,
  loginSchema,
  type CambiarPasswordInput,
  type LoginInput,
  type UsuarioSesion,
} from '@portal/shared';
import type { Response } from 'express';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import type { Usuario } from '../generated/prisma/client.js';
import { COOKIE_SESION, DURACION_SESION_MS } from './auth.constants.js';
import { aSesion, AuthService } from './auth.service.js';
import { PermiteCambioPendiente, Publica, UsuarioActual } from './decorators.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Publica()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @HttpCode(200)
  async login(
    @Body(new ZodValidationPipe(loginSchema)) body: LoginInput,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UsuarioSesion> {
    const { usuario, token } = await this.auth.login(body);
    res.cookie(COOKIE_SESION, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: DURACION_SESION_MS,
      path: '/',
    });
    return usuario;
  }

  @Publica()
  @Post('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE_SESION, { path: '/' });
  }

  // Lo llama el servidor de Next en cada página, siempre desde la misma IP
  @SkipThrottle()
  @PermiteCambioPendiente()
  @Get('me')
  me(@UsuarioActual() usuario: Usuario): UsuarioSesion {
    return aSesion(usuario);
  }

  @PermiteCambioPendiente()
  @Post('cambiar-password')
  @HttpCode(200)
  cambiarPassword(
    @UsuarioActual() usuario: Usuario,
    @Body(new ZodValidationPipe(cambiarPasswordSchema)) body: CambiarPasswordInput,
  ): Promise<UsuarioSesion> {
    return this.auth.cambiarPassword(usuario, body);
  }
}
