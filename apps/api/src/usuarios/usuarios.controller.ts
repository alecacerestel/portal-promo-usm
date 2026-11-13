import { Body, Controller, Get, Post } from '@nestjs/common';
import { crearUsuarioSchema, type UsuarioCreado } from '@portal/shared';
import type { z } from 'zod';
import { Roles, UsuarioActual } from '../auth/decorators.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import type { Usuario } from '../generated/prisma/client.js';
import { UsuariosService } from './usuarios.service.js';

@Controller('usuarios')
@Roles('ADMIN', 'COORDINADOR')
export class UsuariosController {
  constructor(private readonly usuarios: UsuariosService) {}

  @Get()
  listar() {
    return this.usuarios.listar();
  }

  @Post()
  crear(
    @UsuarioActual() creador: Usuario,
    @Body(new ZodValidationPipe(crearUsuarioSchema)) datos: z.output<typeof crearUsuarioSchema>,
  ): Promise<UsuarioCreado> {
    return this.usuarios.crear(creador, datos);
  }
}
