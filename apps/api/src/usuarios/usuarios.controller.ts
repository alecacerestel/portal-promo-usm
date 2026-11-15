import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import {
  crearUsuarioSchema,
  editarUsuarioSchema,
  type ClaveReseteada,
  type UsuarioCreado,
} from '@portal/shared';
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

  @Patch(':id')
  editar(
    @UsuarioActual() actor: Usuario,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(editarUsuarioSchema)) datos: z.output<typeof editarUsuarioSchema>,
  ) {
    return this.usuarios.editar(actor, id, datos);
  }

  @Post(':id/resetear-clave')
  @HttpCode(200)
  resetearClave(
    @UsuarioActual() actor: Usuario,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ClaveReseteada> {
    return this.usuarios.resetearClave(actor, id);
  }
}
