import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import {
  candidatosUsername,
  claveTemporal,
  crearUsuarioSchema,
  parsearRut,
  type Rol,
  type UsuarioCreado,
} from '@portal/shared';
import type { z } from 'zod';
import { hashPassword } from '../auth/password.js';
import { Prisma, type Usuario } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

type CrearUsuario = z.output<typeof crearUsuarioSchema>;

/** Roles que cada rol puede asignar al crear una cuenta. */
const PUEDE_CREAR: Partial<Record<Rol, Rol[]>> = {
  ADMIN: ['ADMIN', 'COORDINADOR', 'APOYO_EVENTO', 'STAFF', 'POSTULANTE'],
  COORDINADOR: ['APOYO_EVENTO', 'STAFF', 'POSTULANTE'],
};

function campoDuplicado(e: unknown): string | undefined {
  if (!(e instanceof Prisma.PrismaClientKnownRequestError) || e.code !== 'P2002') return;
  // Según el driver, Prisma informa el campo en `target` o en el error original del adapter
  const meta = JSON.stringify(e.meta ?? {});
  return ['username', 'rut', 'email'].find((campo) => meta.includes(campo));
}

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(creador: Usuario, datos: CrearUsuario): Promise<UsuarioCreado> {
    if (!PUEDE_CREAR[creador.rol]?.includes(datos.rol)) {
      throw new ForbiddenException(`No puedes crear usuarios con rol ${datos.rol}`);
    }

    const rut = parsearRut(datos.rut)!; // ya validado por el esquema
    const clave = claveTemporal(rut.cuerpo);
    const passwordHash = await hashPassword(clave);

    // Prueba juan.perez, juan.perez.g, juan.perez2… y se queda con el primero libre.
    // Se deja que la BD detecte el choque (índice único) para que dos altas simultáneas
    // de personas con el mismo nombre no terminen con el mismo usuario.
    for (const username of candidatosUsername(
      datos.nombres,
      datos.apellidoPaterno,
      datos.apellidoMaterno,
    )) {
      try {
        const usuario = await this.prisma.usuario.create({
          data: {
            username,
            rut: rut.cuerpo,
            dv: rut.dv,
            nombres: datos.nombres,
            apellidoPaterno: datos.apellidoPaterno,
            apellidoMaterno: datos.apellidoMaterno || null,
            email: datos.email?.toLowerCase(),
            rol: datos.rol,
            passwordHash,
          },
        });
        return { id: usuario.id, username: usuario.username, claveTemporal: clave };
      } catch (e) {
        const campo = campoDuplicado(e);
        if (campo === 'username') continue;
        if (campo === 'rut') throw new ConflictException('Ya existe un usuario con ese RUT');
        if (campo === 'email') throw new ConflictException('Ya existe un usuario con ese correo');
        throw e;
      }
    }
    throw new Error('inalcanzable: candidatosUsername es infinito');
  }

  listar() {
    return this.prisma.usuario.findMany({
      select: {
        id: true,
        username: true,
        rut: true,
        dv: true,
        nombres: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        email: true,
        rol: true,
        estado: true,
        debeCambiarPassword: true,
      },
      orderBy: [{ apellidoPaterno: 'asc' }, { nombres: 'asc' }],
    });
  }
}
