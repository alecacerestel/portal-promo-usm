import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  claveTemporal,
  parsearRut,
  type CambiarPasswordInput,
  type LoginInput,
  type UsuarioSesion,
} from '@portal/shared';
import type { Usuario } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { hashPassword, verificarPassword } from './password.js';

// Se compara contra este hash cuando el usuario no existe, para no revelar
// por el tiempo de respuesta qué usuarios están registrados.
const HASH_FALSO = hashPassword('usuario-inexistente');

export function aSesion(u: Usuario): UsuarioSesion {
  return {
    id: u.id,
    username: u.username,
    nombres: u.nombres,
    apellidoPaterno: u.apellidoPaterno,
    rol: u.rol,
    debeCambiarPassword: u.debeCambiarPassword,
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /** Acepta nombre de usuario o RUT. Devuelve el usuario y el token de sesión. */
  async login({ usuario, password }: LoginInput) {
    const rut = parsearRut(usuario);
    const encontrado = await this.prisma.usuario.findUnique({
      where: rut ? { rut: rut.cuerpo } : { username: usuario.toLowerCase() },
    });

    const valido = await verificarPassword(password, encontrado?.passwordHash ?? (await HASH_FALSO));
    if (!encontrado || !valido) throw new UnauthorizedException('Usuario o contraseña incorrectos');

    const token = await this.jwt.signAsync({ sub: encontrado.id });
    return { usuario: aSesion(encontrado), token };
  }

  async cambiarPassword(usuario: Usuario, { actual, nueva }: CambiarPasswordInput) {
    if (!(await verificarPassword(actual, usuario.passwordHash))) {
      throw new BadRequestException('La contraseña actual no es correcta');
    }
    if (nueva === claveTemporal(usuario.rut) || nueva.includes(usuario.rut)) {
      throw new BadRequestException('La nueva contraseña no puede basarse en tu RUT');
    }
    const actualizado = await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { passwordHash: await hashPassword(nueva), debeCambiarPassword: false },
    });
    return aSesion(actualizado);
  }
}
