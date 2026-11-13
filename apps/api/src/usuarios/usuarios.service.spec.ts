import { ConflictException, ForbiddenException } from '@nestjs/common';
import { Prisma, type Usuario } from '../generated/prisma/client.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { UsuariosService } from './usuarios.service.js';

function duplicado(campo: string) {
  return new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    clientVersion: 'test',
    meta: { target: [campo] },
  });
}

const admin = { rol: 'ADMIN' } as Usuario;
const datos = {
  rut: '12.345.678-5',
  nombres: 'Juan',
  apellidoPaterno: 'Pérez',
  apellidoMaterno: 'González',
  rol: 'STAFF' as const,
};

describe('UsuariosService.crear', () => {
  const create = vi.fn();
  const service = new UsuariosService({ usuario: { create } } as unknown as PrismaService);

  beforeEach(() => {
    create.mockReset();
    create.mockImplementation(({ data }) => Promise.resolve({ id: 'id', ...data }));
  });

  it('crea nombre.apellido con la clave temporal del RUT', async () => {
    await expect(service.crear(admin, datos)).resolves.toEqual({
      id: 'id',
      username: 'juan.perez',
      claveTemporal: '345678',
    });
  });

  it('si el usuario ya existe prueba el siguiente candidato', async () => {
    create.mockRejectedValueOnce(duplicado('username')).mockRejectedValueOnce(duplicado('username'));
    const creado = await service.crear(admin, datos);
    expect(creado.username).toBe('juan.perez2');
    expect(create).toHaveBeenCalledTimes(3);
  });

  it('informa cuando el RUT ya está registrado', async () => {
    create.mockRejectedValueOnce(duplicado('rut'));
    await expect(service.crear(admin, datos)).rejects.toBeInstanceOf(ConflictException);
  });

  it('un coordinador no puede crear administradores', async () => {
    const coordinador = { rol: 'COORDINADOR' } as Usuario;
    await expect(service.crear(coordinador, { ...datos, rol: 'ADMIN' })).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(create).not.toHaveBeenCalled();
  });
});
