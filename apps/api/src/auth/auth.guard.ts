import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Rol } from '@portal/shared';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service.js';
import { COOKIE_SESION } from './auth.constants.js';
import { ES_PUBLICA, PERMITE_CAMBIO_PENDIENTE, ROLES_PERMITIDOS } from './decorators.js';

/**
 * Guard global: toda ruta requiere sesión salvo las marcadas con @Publica().
 * El usuario se lee desde la BD en cada request, así un cambio de rol o estado aplica de inmediato.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const metadata = <T>(clave: string) =>
      this.reflector.getAllAndOverride<T>(clave, [ctx.getHandler(), ctx.getClass()]);

    if (metadata<boolean>(ES_PUBLICA)) return true;

    const req = ctx.switchToHttp().getRequest<Request>();
    const token: string | undefined = req.cookies?.[COOKIE_SESION];
    if (!token) throw new UnauthorizedException('Debes iniciar sesión');

    let sub: string;
    try {
      ({ sub } = await this.jwt.verifyAsync<{ sub: string }>(token));
    } catch {
      throw new UnauthorizedException('Sesión expirada');
    }

    const usuario = await this.prisma.usuario.findUnique({ where: { id: sub } });
    if (!usuario) throw new UnauthorizedException('Sesión inválida');
    Object.assign(req, { usuario });

    if (usuario.debeCambiarPassword && !metadata<boolean>(PERMITE_CAMBIO_PENDIENTE)) {
      throw new ForbiddenException('Debes cambiar tu contraseña temporal');
    }

    const roles = metadata<Rol[]>(ROLES_PERMITIDOS);
    if (roles && !roles.includes(usuario.rol)) {
      throw new ForbiddenException('No tienes permiso para esto');
    }
    return true;
  }
}
