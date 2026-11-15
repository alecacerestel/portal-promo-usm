import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
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
    create
      .mockRejectedValueOnce(duplicado('username'))
      .mockRejectedValueOnce(duplicado('username'));
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

describe('UsuariosService.editar y resetearClave', () => {
  const findUnique = vi.fn();
  const update = vi.fn();
  const service = new UsuariosService({
    usuario: { findUnique, update },
  } as unknown as PrismaService);

  const adminActor = { id: 'admin', rol: 'ADMIN' } as Usuario;
  const coordinador = { id: 'coord', rol: 'COORDINADOR' } as Usuario;
  const staff = { id: 'staff', rol: 'STAFF', rut: '12345678', username: 'juan.perez' } as Usuario;
  const otroAdmin = { id: 'otro', rol: 'ADMIN', rut: '11111111', username: 'ana.soto' } as Usuario;

  beforeEach(() => {
    findUnique.mockReset();
    update.mockReset();
    update.mockImplementation(({ data }) => Promise.resolve(data));
  });

  it('un coordinador puede cambiar el estado de un staff', async () => {
    findUnique.mockResolvedValue(staff);
    await service.editar(coordinador, staff.id, { estado: 'CONGELADO' });
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'staff' },
        data: expect.objectContaining({ estado: 'CONGELADO' }),
      }),
    );
  });

  it('un coordinador no puede modificar a un admin', async () => {
    findUnique.mockResolvedValue(otroAdmin);
    await expect(
      service.editar(coordinador, otroAdmin.id, { activo: false }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(update).not.toHaveBeenCalled();
  });

  it('un coordinador no puede ascender a alguien a admin', async () => {
    findUnique.mockResolvedValue(staff);
    await expect(service.editar(coordinador, staff.id, { rol: 'ADMIN' })).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('nadie puede desactivarse ni quitarse el rol a sí mismo', async () => {
    findUnique.mockResolvedValue(adminActor);
    await expect(service.editar(adminActor, 'admin', { activo: false })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(service.editar(adminActor, 'admin', { rol: 'STAFF' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('"" en el correo lo borra', async () => {
    findUnique.mockResolvedValue(staff);
    await service.editar(adminActor, staff.id, { email: '' });
    expect(update.mock.calls[0][0].data.email).toBeNull();
  });

  it('informa si no existe', async () => {
    findUnique.mockResolvedValue(null);
    await expect(service.editar(adminActor, 'x', { estado: 'ACTIVO' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('resetear vuelve a la clave temporal y obliga a cambiarla', async () => {
    findUnique.mockResolvedValue(staff);
    await expect(service.resetearClave(adminActor, staff.id)).resolves.toEqual({
      username: 'juan.perez',
      claveTemporal: '345678',
    });
    expect(update.mock.calls[0][0].data.debeCambiarPassword).toBe(true);
  });
});
