import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  candidatosUsername,
  claveTemporal,
  crearUsuarioSchema,
  editarUsuarioSchema,
  parsearRut,
  type ClaveReseteada,
  type Rol,
  type UsuarioCreado,
} from '@portal/shared';
import type { z } from 'zod';
import { hashPassword } from '../auth/password.js';
import { Prisma, type Usuario } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

type CrearUsuario = z.output<typeof crearUsuarioSchema>;
type EditarUsuario = z.output<typeof editarUsuarioSchema>;

/** Roles que cada rol puede asignar y gestionar (crear, editar, resetear clave). */
const PUEDE_GESTIONAR: Partial<Record<Rol, Rol[]>> = {
  ADMIN: ['ADMIN', 'COORDINADOR', 'APOYO_EVENTO', 'STAFF', 'POSTULANTE'],
  COORDINADOR: ['APOYO_EVENTO', 'STAFF', 'POSTULANTE'],
};

const puedeGestionar = (actor: Usuario, rol: Rol) => !!PUEDE_GESTIONAR[actor.rol]?.includes(rol);

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
    if (!puedeGestionar(creador, datos.rol)) {
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

  /** Busca al usuario y verifica que el actor pueda gestionarlo. */
  private async gestionable(actor: Usuario, id: string): Promise<Usuario> {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    if (!puedeGestionar(actor, usuario.rol)) {
      throw new ForbiddenException('No puedes modificar a este usuario');
    }
    return usuario;
  }

  async editar(actor: Usuario, id: string, datos: EditarUsuario) {
    await this.gestionable(actor, id);

    if (datos.rol && !puedeGestionar(actor, datos.rol)) {
      throw new ForbiddenException(`No puedes asignar el rol ${datos.rol}`);
    }
    // Evita que alguien se quite sus propios permisos (y que el sistema quede sin admin)
    if (actor.id === id && (datos.activo === false || (datos.rol && datos.rol !== actor.rol))) {
      throw new BadRequestException('No puedes desactivarte ni cambiar tu propio rol');
    }

    try {
      return await this.prisma.usuario.update({
        where: { id },
        data: {
          ...datos,
          apellidoMaterno:
            datos.apellidoMaterno === undefined ? undefined : datos.apellidoMaterno || null,
          email: datos.email === undefined ? undefined : datos.email?.toLowerCase() || null,
        },
        select: SELECT_FILA,
      });
    } catch (e) {
      if (campoDuplicado(e) === 'email') {
        throw new ConflictException('Ya existe un usuario con ese correo');
      }
      throw e;
    }
  }

  /** Vuelve a la clave temporal y obliga a cambiarla en el próximo ingreso. */
  async resetearClave(actor: Usuario, id: string): Promise<ClaveReseteada> {
    const usuario = await this.gestionable(actor, id);
    if (actor.id === id) {
      throw new BadRequestException('Para cambiar tu clave usa "Cambiar contraseña"');
    }
    const clave = claveTemporal(usuario.rut);
    await this.prisma.usuario.update({
      where: { id },
      data: { passwordHash: await hashPassword(clave), debeCambiarPassword: true },
    });
    return { username: usuario.username, claveTemporal: clave };
  }

  listar() {
    return this.prisma.usuario.findMany({
      select: SELECT_FILA,
      orderBy: [{ apellidoPaterno: 'asc' }, { nombres: 'asc' }],
    });
  }
}

/** Campos que ve el admin en el listado (nunca el hash de la clave). */
const SELECT_FILA = {
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
  activo: true,
  debeCambiarPassword: true,
} satisfies Prisma.UsuarioSelect;
